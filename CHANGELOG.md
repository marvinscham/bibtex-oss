# Changelog

This project's changelog structure is based on [keep a changelog](https://keepachangelog.com/), extended by explicit `Dev` sections to highlight changes not impacting user interactions. The versioning strategy is based on [SemVer](https://semver.org/).

## v0.3.0 2024-03-28

### Added

- arXiv support, either auto-detected with `arxiv:` prefix or manually specified

### Dev

- Added tests for frontend and backend to CI

## v0.2.3 2024-03-26

### Dev

- Repackaged backend into separate directory
- Added tests

### Fixed

- The API will no longer be called when submitting empty input
- Requests against ISBNs that don't return author info will no longer fail

## v0.2.2 2024-03-25

### Dev

- Added automatic image build & push to GitHub container repository
- Added auto-deployment of public instance on update

## v0.2.1 2024-03-25

### Dev

- Dependency updates

## v0.2.0 2024-03-13

### Added

- Privacy policy and legal notice

## v0.1.0 2024-03-13 Project Init

### Added

- Support for DOIs, ISBNs, URLs
- Output is automatically tidied up
- Usage tracking with public dashboard
- BibTeX Tidy subpage
