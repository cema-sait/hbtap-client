# Changelog

All notable changes to this project will be documented in this file.

---

## [1.4.0] - 2026-03-11

###  Added
- Public **Interventions Module - Sytem categorization ans Configuration Tool Setup**
  - Public interventions listing page with filters and pagination
  - Intervention detail page accessible via reference number
  - Submitted portal page for public tracking
  - Public API client and shared types (`public`, `common`)
- Role-based access support (user roles & permissions)

### UI / UX (Major Redesign)
- Complete homepage redesign maintaining consistency in page design:
  - Hero section
  - About section
  - News section
- New design system applied across public pages
- Redesigned layouts:
  - Navbar
  - Footer
- Updated pages to new UI system:
  - About
  - Governance
  - News
  - FAQs
  - Contact
###  Changed
- Restructured application UI architecture
- New typography adjustment instead of the default
- Improved routing structure for public modules
- Refactored layout composition for scalability
- Minor updates to authentication API

###  Improved
- Component consistency and reuse
- Page responsiveness and accessibility
- Code organization for public vs authenticated modules
- New typography

---

## [1.3.0] - 2026-02-26
### Changed
- Updated dependencies to latest **secure versions**
- Security and stability improvements

### Dependencies
- Next.js: ^16.1.6
- React: ^19.2.4
- React DOM: ^19.2.4

---

## [1.2.0] - 2025-12-08
### Changed
- Updated project dependencies to latest versions

---

## [1.1.0] - 2025-11-24
### Added
- Events and governance updates
- Analytics integration
- Details page improvements

### Improved
- Image optimization and URL handling
- UI refinements

---

## [1.0.0] - 2025-10-13
### Added
- Initial production setup
- Contact form submission and validation
- Authentication and core components
- API restructuring
- Robots.txt and sitemap support