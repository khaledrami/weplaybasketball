# Internationalization Specification

## Purpose
Support Català and Castellano from day 1 with a structured i18n architecture.

## Requirements

### Requirement: Language Support
The system MUST support Català (ca) and Castellano (es) as first-class languages.

#### Scenario: Default language detection
- GIVEN a user opens the app for the first time
- WHEN the device language is Catalan
- THEN the app displays in Català
- AND the user can switch to Castellano in settings

#### Scenario: Default language — Spanish device
- GIVEN a user opens the app for the first time
- WHEN the device language is Spanish
- THEN the app displays in Castellano
- AND the user can switch to Català in settings

### Requirement: Language Switching
The system MUST allow users to change language at any time.

#### Scenario: Switch language
- GIVEN a user is in the settings screen
- WHEN the user selects a different language
- THEN the entire app UI updates immediately
- AND the selected language persists across app restarts

### Requirement: Content Coverage
The system MUST translate all user-facing text.

#### Scenario: All screens translated
- GIVEN a user switches language
- WHEN any screen loads
- THEN all labels, buttons, error messages, and notifications are in the selected language
- AND no untranslated text is visible

#### Scenario: Dynamic content
- GIVEN a match is created with a French-speaking creator
- WHEN the match appears in the list
- THEN the match language field shows the original value
- AND UI elements around it are in the user's selected language

### Requirement: RTL Support Preparation
The system SHOULD be architected to support future RTL languages.

#### Scenario: i18n structure
- GIVEN the i18n system is implemented
- WHEN a new language is added
- THEN no code changes are needed beyond adding a translation file
- AND the UI layout adapts if the new language requires RTL
