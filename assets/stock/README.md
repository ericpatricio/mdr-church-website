# Temporary stock photography

These four images were downloaded from Pexels on October 28, 2026, at a maximum width of 1400px and JPEG quality 85. Total size is approximately 569 KB. The original source URLs, authors and license link are listed in credits.json.

License inspected: https://www.pexels.com/license/. Pexels allows website use and modification; attribution is appreciated but not required. People and brands must not be represented as endorsing MDR. Every displayed image therefore carries a visible bilingual caption: temporary stock image, not MDR. The stock does not document real church activities, programs, pastors or membership. No stock portraits are placed under the pastors' names.

Existing authentic MDR worship and exterior photos and the original logos remain in use. The two pastoral cards remain labeled photo placeholders.

## Replace with authorized MDR photos

1. Put the approved optimized photo in assets/ with a descriptive filename; keep original source files outside the public repository if they contain private metadata or unnecessary personal data.
2. Update the appropriate ministry record's photo, photoWidth and photoHeight in content/site.mjs. Update the image's bilingual alternative text.
3. Change the ministryPhoto helper to render the approved photograph with an authentic-photo caption, rather than calling stockPhoto for that record. Do not leave a stock caption on an authentic image, or remove the label while still using a stock photo.
4. For the message illustration, update both messageSection and the empty library template in scripts/build.mjs; use a verified recording thumbnail only when it belongs to that recording.
5. Record provenance in assets/SOURCES.md, rebuild, run npm run check and npm test, and review both languages before publishing.

Changing a stock photo does not confirm ministry activities, dates, leaders or schedules. Keep unconfirmed details unpublished.
