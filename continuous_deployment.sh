#!/usr/bin/env bash

HELM_UPDATE_COMMIT_MESSAGE="${K8S_ENVIRONMENT_NAME} chatops image update --no-deploy"

RES=0

cd /chatops;

! gcloud container builds submit --substitutions _IMAGE_TAG=${IMAGE_TAG} \
                                 --config continuous_deployment_cloudbuild.yaml \
                                 . \
    && echo 'failed to build chatops image' && RES=1;

cd /ops

! ./helm_update_values.sh "${B64_UPDATE_VALUES}" "${HELM_UPDATE_COMMIT_MESSAGE}" "${K8S_OPS_GITHUB_REPO_TOKEN}" \
                          "${OPS_REPO_SLUG}" "${OPS_REPO_BRANCH}" \
    && echo 'failed helm update values' && RES=1;

! ./helm_upgrade_external_chart.sh chatops \
    && echo "failed to upgrade chatops chart" && RES=1;

while ! kubectl rollout status deployment chatops --watch=false; do
    echo 'waiting for chatops deployment rollout';
    for POD in `kubectl get pods | grep chatops- | cut -d" " -f1 -`; do
        POD_JSON=`kubectl get -ojson pod $POD`;
        POD_STATUS=`echo "${POD_JSON}" | jq -r .status.phase`;
        if [ "${POD_STATUS}" != "Running" ]; then
            kubectl describe pod $POD;
            kubectl logs --tail=100 $POD -c chatops;
        fi;
    done;
    echo "sleeping for 60 seconds"
    sleep 60;
done;

exit $RES
