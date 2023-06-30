#!/bin/bash

# exit when any command fails
set -e

region="europe-west1"
pubsub_cron_topic="cron-trigger"
pubsub_pic_topic="price-impact-calculation-request"
pubsub_pic_sub="price-impact-calculations"
cron_job="hourly"
cron_schedule="0 * * * *" # run every hour

printf "\nChecking if pubsub topic '%s' exists... " "$pubsub_cron_topic"
if ! gcloud pubsub topics describe $pubsub_cron_topic &>/dev/null; then
    printf "\nDoesn't exist. Creating new pubsub topic '%s'...\n" "$pubsub_cron_topic"
    gcloud pubsub topics create $pubsub_cron_topic
    printf "\n✅ Successfully created pubsub topic '%s'" "$pubsub_cron_topic"
else
    printf "✅"
fi

printf "\nChecking if pubsub topic '%s' exists... " "$pubsub_pic_topic"
if ! gcloud pubsub topics describe $pubsub_pic_topic &>/dev/null; then
    printf "\nDoesn't exist. Creating new pubsub topic '%s'...\n" "$pubsub_pic_topic"
    gcloud pubsub topics create $pubsub_pic_topic
    printf "\n✅ Successfully created pubsub topic '%s'" "$pubsub_pic_topic"
else
    printf "✅"
fi

printf "\nChecking if pubsub subscription for '%s' exists... " "$pubsub_pic_sub"
if ! gcloud pubsub subscriptions describe $pubsub_pic_sub &>/dev/null; then
    printf "\nDoesn't exist. Creating new pubsub subscription '%s'...\n" "$pubsub_pic_sub"
    gcloud pubsub subscriptions create $pubsub_pic_sub --topic $pubsub_cron_topic
    printf "✅ Successfully created pubsub subscription '%s' for topic '%s'" "$pubsub_pic_sub" "$pubsub_cron_topic"
else
    printf "✅"
fi

printf "\nChecking if cloud scheduler job '%s' exists... " $cron_job
if ! gcloud scheduler jobs describe $cron_job --location=$region &>/dev/null; then
    printf "\nDoesn't exist. Creating new scheduler job '%s' with schedule '%s'...\n" "$cron_job" "$cron_schedule"
    gcloud scheduler jobs create pubsub $cron_job --schedule="$cron_schedule" --topic=$pubsub_cron_topic --message-body="go" --location=$region
    printf "\n✅ Successfully created scheduler job '%s' to trigger pubsub topic '%s' on the schedule '%s'" "$cron_job" "$pubsub_cron_topic" "$cron_schedule"
else
    printf "✅"
fi

printf "\n\n🎉 You're all set!"
