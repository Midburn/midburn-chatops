# Midburn ChatOps Server

Allows to perform "devops" tasks from Slack

## Quickstart

You will need to get a slack API token (can be done from Slack web UI)

```
echo `read -p "Enter the slack token key: "; echo $REPLY` > ./secret-slack-token
export slack_token_path=./secret-slack-token
npm install
npm start
```


## Testing the docker build

```
docker build -t midburn-chatops .
docker run -it \
           -v `pwd`/secret-slack-token:/src/secret-slack-token \
           -e slack_token_path=./secret-slack-token \
           midburn-chatops
```
