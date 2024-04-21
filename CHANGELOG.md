## [3.0.2](https://github.com/megazazik/factory-di/compare/v3.0.1...v3.0.2) (2024-04-21)


### Bug Fixes

* **factory:** fix type for factory child depencencies ([e868762](https://github.com/megazazik/factory-di/commit/e8687625d68b099b3db183061e41a97248c81873))



## [3.0.1](https://github.com/megazazik/factory-di/compare/v3.0.0...v3.0.1) (2024-02-04)


### Bug Fixes

* **types:** restore type AllDependenciesOfContainer ([9debdbc](https://github.com/megazazik/factory-di/commit/9debdbcb1f7ee90226eb29e6fbf8854e83a8f01c))



# [3.0.0](https://github.com/megazazik/factory-di/compare/v2.0.0...v3.0.0) (2024-02-03)


### Features

* change resolving dependencies method, new singleton behavior ([e8a9a85](https://github.com/megazazik/factory-di/commit/e8a9a85394fc52c771acfeac25e7500ebffd47cc))


### BREAKING CHANGES

* Removed the old singleton function (use the new singleton method instead). Now you
should register dependencies only in the container itself or in its parent container



# [2.0.0](https://github.com/megazazik/factory-di/compare/v1.0.0...v2.0.0) (2023-08-06)


### Features

* **factory:** add implementation of factory from container ([8a0ecd5](https://github.com/megazazik/factory-di/commit/8a0ecd558de7a7d5625cb0d9e4df880fac25369e))
* **factory:** add type tests for factory from container ([e4fef79](https://github.com/megazazik/factory-di/commit/e4fef79169596ef5a7b75cf2e3371f4da51f5354))



# [1.0.0](https://github.com/megazazik/factory-di/compare/v0.2.2...v1.0.0) (2021-12-01)


### Features

* dependencies can be registered during container initialization ([03c2449](https://github.com/megazazik/factory-di/commit/03c244999d86233b921c15058b935f67cf8f00e9))
* resolve method can get unregistered dependencies now ([54c3f8c](https://github.com/megazazik/factory-di/commit/54c3f8cc96efe972ac0ab8900679b2912bfd07be))
* simple value can be registered without the 'constant' function call ([52bdc87](https://github.com/megazazik/factory-di/commit/52bdc87cda279a7ccab0765f155fae4c5fd72ae5))



## [0.2.2](https://github.com/megazazik/factory-di/compare/v0.2.1...v0.2.2) (2021-05-25)


### Features

* **types:** improve IDE tips for the register method ([9097d61](https://github.com/megazazik/factory-di/commit/9097d610bc7a8dbcf38fb80ecd47c973b98e0383))



## [0.2.1](https://github.com/megazazik/factory-di/compare/v0.2.0...v0.2.1) (2021-05-25)


### Features

* **types:** add AllDependenciesOfContainer type helper ([c7a9b1f](https://github.com/megazazik/factory-di/commit/c7a9b1f6ead2003f494aa3e41e1bda85e29fdb97))



# [0.2.0](https://github.com/megazazik/factory-di/compare/v0.1.1...v0.2.0) (2021-05-23)


### Features

* **register:** map of dependencies can be passed to the register method ([920c7bb](https://github.com/megazazik/factory-di/commit/920c7bbc00acfda149b4f64fcf0470eeba24ceea))



## [0.1.1](https://github.com/megazazik/factory-di/compare/v0.1.0...v0.1.1) (2021-05-20)


### Bug Fixes

* **types:** better IDE help integration for Class and computedValue ([a529cd9](https://github.com/megazazik/factory-di/commit/a529cd93cf8ea7bf9fa47fa4b3d03e3f07fb4b95))



# 0.1.0 (2021-01-12)



