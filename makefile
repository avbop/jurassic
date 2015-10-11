HTML=index.html
JS=game.js init.js classes.js
CSS=style.css
ASSETS=$(wildcard assets/*)
SRCS=$(HTML) $(JS) $(CSS) $(ASSETS)
DEPLOY_DIR=~/Dropbox/Public/jurassic
DEPLOY_SRCS=$(SRCS:%=$(DEPLOY_DIR)/%) $(DEPLOY_DIR)/phaser.js

all: deploy

deploy: $(DEPLOY_SRCS)

$(DEPLOY_DIR)/%: %
	mkdir -p $(DEPLOY_DIR)/assets
	cp $< $@

$(DEPLOY_DIR)/phaser.js: phaser.min.js
	mkdir -p $(DEPLOY_DIR)
	cp $< $@

$(DEPLOY_DIR)/%.js: %.js
	mkdir -p $(DEPLOY_DIR)
	closure --js $< --js_output_file $@

$(DEPLOY_DIR)/%.css: %.css
	mkdir -p $(DEPLOY_DIR)
	yuicompressor -o $@ $<

server:
	python3 -m http.server 8080

clean:
	rm -r $(DEPLOY_DIR)
	rm *.pyc

.PHONY: clean deploy server all
.IGNORE: clean
