#!/bin/bash
# exit when any command fails
set -e

# THE PROBLEM
# The main challenge is that Google Cloud Functions expects all dependencies of a function to be
# published npm packages. But in package.json we're referencing local dependencies outside this
# folder that aren't published and won't be available when Google Cloud builds this function on CI
#
# THE SOLUTION
# We replace all local monorepo dependencies (i.e. { "user": "*"}) with hard file dependencies on
# { "user": "file:/./user-1.0.0.tgz" } by packing all required packages into tarballs and copying
# them into this folder at deploy time. Now the Cloud Function deployment process has all required
# files available and will install our local packages directly from the tarballs.

# Define infra specs
memory="512MiB"
region="europe-west1"
runtime="nodejs18"
secrets="INFURA_API_KEY=INFURA_API_KEY:latest,TELEGRAM_BOT_TOKEN=TELEGRAM_BOT_TOKEN:latest"
timeout="540"
ingress_settings="all"
debug_packages="alerts,curve,telegram,user-alerts"

# Extract the function name from the command-line argument
repo_name=$1

# Check the function name and set the trigger flag accordingly
if [[ "$repo_name" == "bot" ]]; then
  trigger="--trigger-http"
  function_name="botFunction"
  auth="--allow-unauthenticated"
  webhook_url=$(grep -w "PROD_WEBHOOK_URL" .env | cut -d '=' -f2-)
  # ^|^ changes the argument's delimiter from ',' to '|' because the DEBUG env var itself is comma-delimited
  env_vars="--set-env-vars=^|^PROD_WEBHOOK_URL=$webhook_url|DEBUG=bot,$debug_packages"
elif [[ "$repo_name" == "peg-checker" ]]; then
  trigger="--trigger-topic=cron-trigger"
  function_name="pegChecker"
  auth=""
  env_vars="DEBUG=peg-checker,$debug_packages"
else
  echo "Invalid function name. Supported function names: bot, peg-checker"
  exit 1
fi

# Build everything
echo "⏳ Running 'turbo build --force'..."
if turbo build --force >/dev/null 2>&1; then
  echo "✅ 'turbo build' successful"
  printf "\n"
else
  echo "❌ 'npm pack' failed"
  exit 1
fi

# Pack all ./packages into *.tgz files so we can bundle them into this package to avoid missing dependencies
# at runtime (because we're not uploading the entire monorepo to Google Cloud Functions, only this function)"
echo "️⏳ Running 'turbo pack' on all packages..."
cd ../..
if turbo pack >/dev/null 2>&1; then
  echo "✅ 'turbo pack' successful"
  printf "\n"
else
  echo "❌ 'turbo pack' failed"
  exit 1
fi
cd apps/"$repo_name"

# Back up package.json before editing it
echo "⏳ Backing up package.json..."
if cp package.json package.json.bak >/dev/null 2>&1; then
  echo "✅ Backed up package.json"
  printf "\n"
else
  echo "❌ Failed to back up package.json"
fi

# Copy all tarballs into this directory
echo "⏳ Copying tarballs of packages/** dependencies into this folder..."
for dir in ../../packages/*/; do
  base_dir=$(basename "$dir")

  file=$(find "$dir" -name "$base_dir-*.tgz" -print -quit)
  if [ -n "$file" ]; then
    cp "$file" .
    version=$(node -p "require('$dir/package.json').version")
    sed -i '' "s|\"$base_dir\": \"\*\"|\"$base_dir\": \"file:./$base_dir-$version.tgz\"|" package.json
  fi

  if [ $? -ne 0 ]; then
    echo "❌ Error copying package tarball from $dir"
    exit 1
  fi
done
echo "✅ Copied all package tarballs into this folder"
printf "\n"

echo "🌀 Deploying to Google Cloud..."
if gcloud functions deploy $function_name \
  --entry-point=$function_name \
  --gen2 \
  --memory="$memory" \
  --region=$region \
  --runtime=$runtime \
  --set-secrets=$secrets \
  --timeout=$timeout \
  --ingress-settings=$ingress_settings \
  $trigger \
  $auth \
  "$env_vars"; then
  printf "\n✅ Successfully deployed function '%s'\n\n" "$function_name"
else
  printf "\n❌ Deployment failed\n\n"
fi

# Restore original package.json
echo "⏳ Restoring original package.json..."

if rm package.json && mv package.json.bak package.json 2>&1; then
  echo "✅ Restored original package.json"
  printf "\n"
else
  echo "❌ Failed to restore original package.json"
  exit 1
fi
