# Deployment Guide — House of Health Well Pro (Nutrition Planner)

## Architecture

```
Internet → [Domain] → EC2 (Ubuntu, t3.micro+)
                        ├── python3 server.py (port 80)
                        ├── /api/vn-food proxy → viendinhduong.vn
                        └── Static files (index.html, js/, css/, docs/images/)
```

## Prerequisites

- AWS account with EC2, S3, SSM permissions
- AWS CLI configured (`aws configure` or IAM role)
- A domain name (optional, for HTTPS)
- Local copy of the app repo

## Step 1: Prepare Deployment Package

```bash
# From the project root
tar czf /tmp/app.tar.gz \
  --exclude='.git' \
  --exclude='raw_data/FoodData*' \
  index.html server.py css/ js/ docs/images/
```

## Step 2: Upload to S3

```bash
BUCKET="nutrition-app-deploy-$(aws sts get-caller-identity --query Account --output text)"
aws s3 mb s3://$BUCKET 2>/dev/null
aws s3 cp /tmp/app.tar.gz s3://$BUCKET/app.tar.gz
```

## Step 3: Launch EC2 Instance

```bash
# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name nutrition-app-sg \
  --description "Nutrition app" \
  --query 'GroupId' --output text)

# Open ports
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0

# Launch instance (Ubuntu 22.04, t3.micro, with SSM role)
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id ami-0c7217cdde317cfec \
  --instance-type t3.micro \
  --security-group-ids $SG_ID \
  --iam-instance-profile Name=SSMInstanceProfile \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=nutrition-app}]' \
  --query 'Instances[0].InstanceId' --output text)

echo "Instance: $INSTANCE_ID"
aws ec2 wait instance-running --instance-ids $INSTANCE_ID
```

> **Note**: If you don't have an SSM Instance Profile, create a key pair instead:
> ```bash
> aws ec2 create-key-pair --key-name nutrition-key --query 'KeyMaterial' --output text > nutrition-key.pem
> chmod 400 nutrition-key.pem
> # Add --key-name nutrition-key to run-instances
> ```

## Step 4: Allocate Elastic IP

```bash
ALLOC_ID=$(aws ec2 allocate-address --query 'AllocationId' --output text)
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOC_ID
PUBLIC_IP=$(aws ec2 describe-addresses --allocation-ids $ALLOC_ID --query 'Addresses[0].PublicIp' --output text)
echo "Public IP: $PUBLIC_IP"
```

## Step 5: Deploy App (via SSM)

```bash
aws ssm send-command \
  --instance-ids $INSTANCE_ID \
  --document-name "AWS-RunShellScript" \
  --parameters '{"commands":[
    "#!/bin/bash",
    "set -e",
    "apt-get update -qq && apt-get install -y -qq python3 awscli",
    "mkdir -p /opt/nutrition-app",
    "aws s3 cp s3://'"$BUCKET"'/app.tar.gz /tmp/app.tar.gz",
    "tar xzf /tmp/app.tar.gz -C /opt/nutrition-app/",
    "sed -i \"s/8000/80/g\" /opt/nutrition-app/server.py",
    "pkill -f \"python3 /opt/nutrition-app/server.py\" || true",
    "cd /opt/nutrition-app && nohup python3 server.py > /var/log/nutrition-app.log 2>&1 &",
    "sleep 2 && curl -s -o /dev/null -w \"%{http_code}\" http://localhost/ && echo \" OK\""
  ]}' \
  --query 'Command.CommandId' --output text
```

### Deploy via SSH (alternative)

```bash
scp -i nutrition-key.pem -r index.html server.py css/ js/ docs/ ubuntu@$PUBLIC_IP:/opt/nutrition-app/
ssh -i nutrition-key.pem ubuntu@$PUBLIC_IP "cd /opt/nutrition-app && sed -i 's/8000/80/' server.py && sudo nohup python3 server.py > /var/log/nutrition-app.log 2>&1 &"
```

## Step 6: Verify

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://$PUBLIC_IP/
curl -s "http://$PUBLIC_IP/api/vn-food?page=1&name=pho" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'VN API: {d[\"total\"]} results')"
```

Open in browser: `http://<PUBLIC_IP>`

## Step 7: Domain + HTTPS (Optional)

### Register domain (external)
- Namecheap: `.link` ($5/yr), `.site` ($3/yr), `.com` ($10/yr)
- Suggested names: `healthwellpro.link`, `nutritionvn.site`, `houseofhealthpro.com`
- Point A record to your Elastic IP

### Install Let's Encrypt SSL

```bash
ssh -i nutrition-key.pem ubuntu@$PUBLIC_IP
sudo apt install -y certbot
# Stop server temporarily for cert
sudo pkill -f server.py
sudo certbot certonly --standalone -d yourdomain.com
# Update server.py to use SSL (see notes below)
```

### SSL server.py modification

Replace the last line of `server.py` with:

```python
import ssl
server = http.server.HTTPServer(('', 443), Handler)
server.socket = ssl.wrap_socket(server.socket,
    certfile='/etc/letsencrypt/live/yourdomain.com/fullchain.pem',
    keyfile='/etc/letsencrypt/live/yourdomain.com/privkey.pem',
    server_side=True)
server.serve_forever()
```

Also add HTTP→HTTPS redirect (run both on port 80 and 443, or use nginx as reverse proxy).

---

## Redeploy (after code changes)

```bash
# From project root
tar czf /tmp/app.tar.gz --exclude='.git' --exclude='raw_data/FoodData*' index.html server.py css/ js/ docs/images/
aws s3 cp /tmp/app.tar.gz s3://$BUCKET/app.tar.gz

# On EC2 (via SSM or SSH)
aws ssm send-command --instance-ids $INSTANCE_ID --document-name "AWS-RunShellScript" \
  --parameters '{"commands":["cd /opt/nutrition-app && aws s3 cp s3://'"$BUCKET"'/app.tar.gz /tmp/app.tar.gz && tar xzf /tmp/app.tar.gz -C /opt/nutrition-app/ && pkill -f server.py; nohup python3 server.py > /var/log/nutrition-app.log 2>&1 &"]}'
```

Or via SSH:
```bash
scp -i nutrition-key.pem -r index.html server.py css/ js/ docs/ ubuntu@$PUBLIC_IP:/opt/nutrition-app/
ssh -i nutrition-key.pem ubuntu@$PUBLIC_IP "pkill -f server.py; cd /opt/nutrition-app && sudo nohup python3 server.py > /var/log/nutrition-app.log 2>&1 &"
```

---

## Cleanup

```bash
# Terminate instance
aws ec2 terminate-instances --instance-ids $INSTANCE_ID

# Release Elastic IP
aws ec2 release-address --allocation-id $ALLOC_ID

# Delete security group (wait for instance termination)
aws ec2 wait instance-terminated --instance-ids $INSTANCE_ID
aws ec2 delete-security-group --group-id $SG_ID

# Delete S3 bucket
aws s3 rb s3://$BUCKET --force
```

---

## Blockers & Workarounds

| Blocker | Workaround |
|---------|-----------|
| Workshop/lab account: no Route 53 domain permission | Register domain externally (Namecheap, GoDaddy) |
| No key pair on instance | Use SSM `send-command` instead of SSH |
| Port 80 requires root on Linux | Run as root (`sudo python3 server.py`) or use iptables redirect from 80→8000 |
| VN food API may be slow from US-East | Deploy in `ap-southeast-1` (Singapore) for lower latency to Vietnam |
| Certbot needs domain pointing to IP first | Set A record, wait for DNS propagation (~5 min), then run certbot |
| Server dies on reboot | Add systemd service (see below) |

## Auto-start on Reboot (systemd)

Create `/etc/systemd/system/nutrition-app.service`:

```ini
[Unit]
Description=Nutrition Planner App
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/nutrition-app
ExecStart=/usr/bin/python3 /opt/nutrition-app/server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable nutrition-app
sudo systemctl start nutrition-app
```

---

## Notes

- App uses `localStorage` for client-side caching — no database needed
- The VN food proxy (`/api/vn-food`) calls `viendinhduong.vn` — requires outbound internet from EC2
- For production with multiple users, consider nginx reverse proxy + gunicorn
- Total app size: ~500KB (excluding raw data files)
- Recommended region for Vietnam users: `ap-southeast-1` (Singapore)
