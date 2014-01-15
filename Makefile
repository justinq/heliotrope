# images
#         Landscape 480x320
#         Portrait  214x320
#       thumbnails
#         Landscape 120x80
#         Portrait   54x80
#   convert raw/photo.jpg -resize 480x320 -strip -quality 50 -interlace line photos/photo.jpg

# Make the html content
SOURCES = $(wildcard content/*.pd content/**/*.pd)
TARGETS = $(patsubst %.pd,%.html,$(SOURCES))

%.html:	%.pd
	pandoc --template=content/template.html \
		--variable=id:$(patsubst %.pd,%,$(subst /,-,$<)) \
		$< -o $@

# make all the content nodes and add them to the index
all:	$(TARGETS) template.html
	cat $(TARGETS) | pandoc --template=template.html -o index.html

clean:
	rm $(TARGETS) index.html
