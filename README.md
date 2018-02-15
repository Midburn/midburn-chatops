# Midburn ChatOps Server

Allows to perform "devops" tasks from Slack

You will need to get a slack API token (can be done from Slack web UI)


## Quickstart

Store the slack token in a file and set the filename in environment variable

```
echo `read -p "Enter the slack token key: "; echo $REPLY` > ./secret-slack-token
export slack_token_path=./secret-slack-token
```

Run the chatops server

```
npm install
npm start
```


## Testing the docker build

Assuming you have following the quickstart and have the slack token in `./secret-slack-token`

```
docker build -t midburn-chatops .
docker run -it \
           -v `pwd`/secret-slack-token:/src/secret-slack-token \
           -e slack_token_path=./secret-slack-token \
           midburn-chatops
```


## Running K8S commands locally

To run K8S environment commands locally you should follow the [midburn K8S README]() so you have access to a cluster.

Ensure it works by running a kubectl command, e.g. `kubectl get nodes`

Set the `MIDBURN_K8S_PATH` environment variable to the full path of the midburn k8s repo, e.g.

```
export MIDBURN_K8S_PATH=/home/user/workspace/midburn-k8s
```

Run the chatops server from the same shell

```
npm start
```

Deployment commands should work (assuming you have the right permissions for your service account)


## Running K8S commands from the docker ops

It works as any other [sk8s-ops image](https://github.com/orihoch/sk8s-ops#sk8s-ops)

You can use the run_docker_ops.sh script to run it:

```
wget https://raw.githubusercontent.com/OriHoch/sk8s/master/run_docker_ops.sh && chmod +x run_docker_ops.sh
```

Build and run the image:

```
docker build -t midburn-chatops . &&\
[ -e ./secret-k8s-ops.json ] &&\
./run_docker_ops.sh "staging" \
                    "source ~/.bashrc; cd /src; npm start" \
                    "midburn-chatops" \
                    "Midburn/midburn-k8s" "master" \
                    "./secret-k8s-ops.json" " -v `pwd`/secret-slack-token:/src/secret-slack-token \
                                              -e slack_token_path=./secret-slack-token "
```
