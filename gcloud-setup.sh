# exit when any command fails
set -e

region="europe-west1"
function_name="pegChecker"
pubsub_topic="cron-trigger"
pubsub_sub="cron-sub"
cron_job="hourly"
cron_schedule="0 * * * *" # run every hour

printf "\nChecking if pubsub topic '$pubsub_topic' exists... "
if ! gcloud pubsub topics describe $pubsub_topic &> /dev/null; then
    printf "\nDoesn't exist. Creating new pubsub topic '$pubsub_topic'...\n"
    gcloud pubsub topics create $pubsub_topic
    printf "\n✅ Successfully created pubsub topic '$pubsub_topic'"
else
    printf "✅"
fi

printf "\nChecking if pubsub subscription for '$pubsub_sub' exists... "
if ! gcloud pubsub subscriptions describe $pubsub_sub &> /dev/null; then
    printf "\nDoesn't exist. Creating new pubsub subscription '$pubsub_sub'...\n"
    gcloud pubsub subscriptions create $pubsub_sub --topic $pubsub_topic
    printf "\n✅ Successfully created pubsub subscription '$pubsub_sub' for topic '$pubsub_topic'"
else
    printf "✅"
fi

printf "\nChecking if cloud scheduler job '$cron_job' exists... "
if !  gcloud scheduler jobs describe $cron_job --location=$region &> /dev/null; then
    printf "\nDoesn't exist. Creating new scheduler job '$cron_job' with schedule '$cron_schedule'...\n"
    gcloud scheduler jobs create pubsub $cron_job --schedule="$cron_schedule" --topic=$pubsub_topic --message-body="go" --location=$region
    printf "\n✅ Successfully created scheduler job '$cron_job' to trigger pubsub topic '$pubsub_topic' on the schedule '$cron_schedule'"
else
    printf "✅"
fi

printf "\nChecking if cloud function '$function_name' exists... "
if ! gcloud functions describe $function_name &> /dev/null; then
    printf "\nDoesn't exist. Deploying new cloud function '$function_name'...\n"
    /bin/bash ./deploy.sh
else
    printf "✅"
fi


echo "\n\n🎉 You're all set!"