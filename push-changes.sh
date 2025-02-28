#!/bin/bash

# Simple script to push changes to GitHub

echo "📦 Staging changes..."
git add .

echo "📝 Enter commit message:"
read commit_message

echo "💾 Committing changes..."
git commit -m "$commit_message"

echo "🚀 Pushing to GitHub..."
git push

echo "✅ Done! Your changes have been pushed to GitHub."
echo "⏳ Wait a few minutes for Azure Static Web Apps to deploy your changes."
echo "🔄 You can check the deployment status in the GitHub Actions tab." 