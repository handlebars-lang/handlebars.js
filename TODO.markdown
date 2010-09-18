* README
* Rationale (how it's different from mustache, and why)

* Refactor blocks/inverted sections so shared code isn't copied and pasted

* Add support for {{^}} when helperMissing is in play.
* Figure out how to allow detection of first/last/iteration when enumerating over arrays.
* Easier way to push context within a block helper, so that it can pass a built context to its function.
