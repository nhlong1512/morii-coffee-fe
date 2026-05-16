# Deployment Guide

This guide covers deploying the Morii Coffee API behind a custom subdomain using GoDaddy DNS.

---

## Table of Contents

- [Custom Domain Setup (GoDaddy)](#custom-domain-setup-godaddy)
- [Nginx Reverse Proxy](#nginx-reverse-proxy)
- [SSL Certificate (Let's Encrypt)](#ssl-certificate-lets-encrypt)
- [Verify the Setup](#verify-the-setup)
- [Route53 — When to Consider It](#route53--when-to-consider-it)

---

## Custom Domain Setup (GoDaddy)

**Goal:** point `moriicoffee-api.zephyr1512.site` → your server IP.

### Step 1 — Find your server's public IP

```bash
# On the server
curl -s ifconfig.me
```

Note the IP — you'll need it in the next step.

### Step 2 — Add an A record in GoDaddy

1. Log in to [GoDaddy](https://dcc.godaddy.com) → **My Products**
2. Click **DNS** next to `zephyr1512.site`
3. Click **Add New Record** and fill in:

   | Field | Value |
   |---|---|
   | Type | `A` |
   | Name | `moriicoffee-api` |
   | Value | `<your server public IP>` |
   | TTL | `600` (10 minutes — keeps propagation fast) |

4. Click **Save**.

> GoDaddy may show a default TTL of 1 hour. Set it to **600 seconds** so changes take effect faster.

### Step 3 — Wait for DNS propagation

GoDaddy typically propagates in **30 minutes – 2 hours**. Check progress:

```bash
# Check from your machine
dig moriicoffee-api.zephyr1512.site +short

# Or use an online tool
# https://dnschecker.org/#A/moriicoffee-api.zephyr1512.site
```

Once you see your server IP returned, DNS is live.

---

## Nginx Reverse Proxy

Install Nginx on your server and create a virtual host for the subdomain.

### Install Nginx

```bash
sudo apt update && sudo apt install -y nginx
```

### Create the site config

```bash
sudo nano /etc/nginx/sites-available/moriicoffee-api
```

Paste the following (replace port `5100` if your API runs on a different port):

```nginx
server {
    listen 80;
    server_name moriicoffee-api.zephyr1512.site;

    location / {
        proxy_pass         http://localhost:5100;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable and reload

```bash
sudo ln -s /etc/nginx/sites-available/moriicoffee-api /etc/nginx/sites-enabled/
sudo nginx -t          # test config — should say "syntax is ok"
sudo systemctl reload nginx
```

---

## SSL Certificate (Let's Encrypt)

**Prerequisite:** DNS must already be propagated (step above) before running Certbot.

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Issue and auto-configure certificate
sudo certbot --nginx -d moriicoffee-api.zephyr1512.site
```

Follow the prompts. Certbot will:
1. Obtain a free TLS certificate from Let's Encrypt
2. Automatically update your Nginx config to redirect HTTP → HTTPS

Certificates renew automatically every 90 days via a systemd timer. Verify:

```bash
sudo systemctl status certbot.timer
```

Your API will now be reachable at:
```
https://moriicoffee-api.zephyr1512.site
```

---

## Verify the Setup

```bash
# 1. DNS resolves correctly
dig moriicoffee-api.zephyr1512.site +short
# Expected: your server IP

# 2. HTTP redirects to HTTPS
curl -I http://moriicoffee-api.zephyr1512.site
# Expected: 301 Moved Permanently → https://...

# 3. HTTPS responds
curl -I https://moriicoffee-api.zephyr1512.site/health
# Expected: 200 OK (or your API's health endpoint response)

# 4. Certificate is valid
curl -v https://moriicoffee-api.zephyr1512.site 2>&1 | grep "SSL certificate"
```

---

## Update Frontend Environment

Once the domain is live, update `.env.production` in this repository:

```env
NEXT_PUBLIC_API_BASE_URL=https://moriicoffee-api.zephyr1512.site/api
```

---

## Route53 — When to Consider It

For a single VPS with one subdomain, **GoDaddy DNS is sufficient**. Route53 adds cost (~$0.50/hosted zone/month) and requires delegating nameservers from GoDaddy to AWS.

Consider migrating to Route53 when:

| Scenario | Why Route53 helps |
|---|---|
| Server is AWS EC2 + ALB | Alias records — no IP needed, auto-updates |
| You need health check + failover | Automatic DNS failover on server down |
| Multiple environments (staging/prod) | Programmatic management via Terraform / AWS CLI |
| You need < 60s propagation | Route53 propagates in seconds vs GoDaddy's ~1h |

To migrate later: add a hosted zone in Route53, copy all GoDaddy DNS records into it, then update the NS records in GoDaddy to point to Route53's nameservers.
