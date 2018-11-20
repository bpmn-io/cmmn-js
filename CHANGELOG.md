# Changelog

All notable changes to [cmmn-js](https://github.com/bpmn-io/cmmn-js) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 0.16.0

* `FEAT`: add ability to move selection with keyboard arrows
* `FEAT`: support `SHIFT` modifier to move elements / canvas with keyboard arrows at accelerated speed
* `FEAT`: require `Ctrl/Cmd` to be pressed as a modifier key to move the canvas via keyboard errors
* `FEAT`: auto-expand elements when children resize
* `CHORE`: bind editor actions and keyboard shortcuts for explicitly added features only
* `CHORE`: update to [`diagram-js@3.0.0`](https://github.com/bpmn-io/diagram-js/blob/master/CHANGELOG.md#300)

### Breaking Changes

* `CmmnGlobalConnect` provider got removed. Use `connection.start` rule to decide whether an element can start a connection.
* `EditorActions` / `Keyboard` do not pull in features implicitly anymore. If you roll your own editor, include features you would like to ship with manually to provide the respective actions / keyboard bindings.
* Moving the canvas with keyboard arrows now requires the `Ctrl/Cmd` modifiers to be pressed.

## 0.15.2

* `FIX`: correct horizontal embedded label alignment

## 0.15.1

* `FIX`: correct case plan model label positioning

## 0.15.0

* `CHORE`: bump to `diagram-js@2`
* `CHORE`: bump to `diagram-js-direct-editing@1.3.0`

## 0.14.5

* `CHORE`: bump dependency versions
* `FIX`: correct line-breaks vanishing during direct editing in IE

## 0.14.4

* `CHORE`: update to `diagram-js@1.3.0`
* `FIX`: focus label editing box on element creation

## 0.14.3

* `FIX`: escape `data-element-id` in CSS selectors

## 0.14.2

* `CHORE`: be able to consume library without `add-module-exports` transform

## 0.14.1

_Rebuild of un-published v0.14.0._

## 0.14.0

### Breaking Changes

* `CHORE`: migrate to `diagram-js@1`
* `FEAT`: build upon ES module foundations. You must use `babelify` + `babel-plugin-add-module-exports` to build custom variants of `cmmn-js` now

## 0.13.0

* `CHORE`: bump to [`diagram-js@0.31.0`](https://github.com/bpmn-io/diagram-js/releases/tag/v0.31.0)

## ...

Check `git log` for earlier history.