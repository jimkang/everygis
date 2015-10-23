HOMEDIR = $(shell pwd)
GITDIR = /var/repos/everygis.git

run:
	node post-everygis-tweet.js

template-offsets:
	node node_modules/.bin/get-file-line-offsets-in-json data/words.txt > \
		data/wordslineoffsets.json

sync-worktree-to-git:
	git --work-tree=$(HOMEDIR) --git-dir=$(GITDIR) checkout -f

npm-install:
	cd $(HOMEDIR)
	npm install
	npm prune

post-receive: sync-worktree-to-git npm-install

pushall:
	git push origin master && git push server master
