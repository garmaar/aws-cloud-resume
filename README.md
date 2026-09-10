
# AWS Cloud Resume Challenge

A serverless resume website deployed on AWS using Infrastructure as Code (Terraform) and CI/CD automation with GitHub Actions.

This project implements a static frontend, a serverless visitor counter backend, and a secure automated deployment pipeline using AWS OIDC federation.

---

# Live Demo

🌐 https://d12vcl4o8nwstz.cloudfront.net

---

# Architecture

The application follows a fully serverless AWS architecture.

```

```
                     GitHub
                        |
                     git push
                        |
                        v
               GitHub Actions
                        |
                       OIDC
                        |
                        v
                AWS IAM Role
                        |
          +-------------+-------------+
          |                           |
          v                           v
    Terraform                    S3 Sync
          |                           |
          v                           v
  AWS Infrastructure            Frontend
                                      |
                                      v
                                 CloudFront
                                      |
                                      v
                                    Users
```

Users
|
v
API Gateway HTTP API
|
v
AWS Lambda
|
v
DynamoDB

```

---

# Features

## Static Website Hosting

The frontend is hosted using:

- Amazon S3
- Amazon CloudFront
- CloudFront Origin Access Control (OAC)

The S3 bucket remains private and only CloudFront can access the website content.

The website is delivered through HTTPS using CloudFront.

---

## Serverless Visit Counter

The project includes a serverless backend to track page visits.

Architecture:

```

GET /visits

API Gateway
|
v
AWS Lambda
|
v
Amazon DynamoDB

```

The Lambda function uses Python and boto3 to update the DynamoDB counter.

Services used:

- Amazon API Gateway HTTP API
- AWS Lambda
- Amazon DynamoDB

---

# Infrastructure as Code

All AWS resources are provisioned and managed using Terraform.

Terraform manages:

- S3 bucket
- CloudFront distribution
- Origin Access Control
- Lambda function
- API Gateway
- DynamoDB table
- IAM roles and policies
- AWS Budget alerts
- GitHub Actions OIDC integration

Infrastructure can be recreated from code without manual AWS Console configuration.

---

# CI/CD Pipeline

Every push to the `main` branch triggers an automated deployment pipeline using GitHub Actions.

Deployment workflow:

```

git push
|
v
GitHub Actions
|
v
AWS Authentication using OIDC
|
v
Terraform Init
|
v
Terraform Validate
|
v
Terraform Apply
|
v
Frontend deployment to S3
|
v
CloudFront cache invalidation

```

The pipeline automatically:

1. Authenticates against AWS using OIDC federation.
2. Obtains temporary AWS credentials through AWS STS.
3. Applies infrastructure changes using Terraform.
4. Uploads frontend changes to S3.
5. Invalidates CloudFront cache.

---

# Security

## Private S3 Hosting

The S3 bucket is not publicly accessible.

CloudFront accesses S3 using:

- CloudFront Origin Access Control (OAC)
- AWS Signature Version 4

---

## Secure CI/CD Authentication

No AWS access keys are stored in GitHub.

Instead, GitHub Actions authenticates using:

```

GitHub Actions
|
v
OIDC Token
|
v
AWS IAM Role
|
v
Temporary AWS Credentials

```

The IAM trust policy restricts access to:

- The specific GitHub repository
- The main branch

---

## IAM Roles

AWS permissions are managed using IAM roles and policies.

Services use:

- Lambda execution roles
- GitHub Actions deployment role
- OIDC federation

---

# Technologies Used

## Cloud

- AWS S3
- AWS CloudFront
- AWS Lambda
- Amazon API Gateway
- Amazon DynamoDB
- AWS IAM
- AWS STS

## Infrastructure

- Terraform
- Terraform AWS Provider

## Development & Automation

- Python
- boto3
- GitHub Actions
- Git
- Linux

---

# Repository Structure

```

.
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── functions/
│   └── visitor-counter/
│       └── src/
│           └── handler.py
│
├── infra/
│   └── environments/
│       └── prod/
│           ├── api.tf
│           ├── dynamodb.tf
│           ├── lambda.tf
│           ├── github_oidc.tf
│           ├── github_actions_permissions.tf
│           ├── outputs.tf
│           └── versions.tf
│
├── site/
│   └── src/
│       ├── index.html
│       ├── styles.css
│       └── scripts.js
│
└── README.md

````

---

# Deployment

Deployment is fully automated through GitHub Actions.

To deploy a new change:

```bash
git add .
git commit -m "update website"
git push
````

The pipeline automatically deploys the changes to AWS.

---

# Key Learnings

Through this project I implemented:

* Serverless AWS architecture design
* Infrastructure as Code with Terraform
* Secure AWS authentication using OIDC federation
* CI/CD automation with GitHub Actions
* IAM roles and permission management
* CloudFront and S3 secure static hosting
* Backend development using Lambda, API Gateway and DynamoDB

---

# Future Improvements

Potential improvements:

* Replace hardcoded deployment values with Terraform outputs consumed by CI/CD.
* Implement stricter IAM least-privilege policies.
* Add automated testing stages.
* Add monitoring and observability using AWS CloudWatch.
* Add custom domain and SSL certificate using Route 53 and ACM.

```
```
