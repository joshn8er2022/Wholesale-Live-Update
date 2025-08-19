
#!/bin/bash

# GitHub Setup Script for Shopify Inventory Tracker
# Replace YOUR_VALID_TOKEN below with a valid GitHub Personal Access Token

echo "Setting up GitHub remote..."

# Check if token is provided as argument
if [ "$1" = "" ]; then
    echo "Usage: ./github-setup.sh YOUR_VALID_TOKEN"
    echo "Please provide a valid GitHub Personal Access Token"
    exit 1
fi

TOKEN=$1

# Add GitHub remote with authentication
git remote add origin https://joshn8er2022:$TOKEN@github.com/joshn8er2022/Wholesale-Live-Update.git

# Push to GitHub
git branch -M main
git push -u origin main

echo "Done! Your project should now be on GitHub."
echo "Visit: https://github.com/joshn8er2022/Wholesale-Live-Update"
