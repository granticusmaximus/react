/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 * @jest-environment node
 */

'use strict';

let React;
let ReactNative;
let createReactNativeComponentClass;
let computeComponentStackForErrorReporting;

function normalizeCodeLocInfo(str) {
  return str && str.replace(/\(at .+?:\d+\)/g, '(at **)');
}

describe('ReactNativeError', () => {
  beforeEach(() => {
    jest.resetModules();

    React = require('react');
    ReactNative = require('react-native-renderer');
    createReactNativeComponentClass = require('../createReactNativeComponentClass')
      .default;
    computeComponentStackForErrorReporting =
      ReactNative.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        .computeComponentStackForErrorReporting;
  });

  it('should be able to extract a component stack from a native view', () => {
    const View = createReactNativeComponentClass('View', () => ({
      validAttributes: {foo: true},
      uiViewClassName: 'View',
    }));

    const ref = React.createRef();

    function FunctionalComponent(props) {
      return props.children;
    }

    class ClassComponent extends React.Component {
      render() {
        return (
          <FunctionalComponent>
            <View foo="test" ref={ref} />
          </FunctionalComponent>
        );
      }
    }

    ReactNative.render(<ClassComponent />, 1);

    let reactTag = ReactNative.findNodeHandle(ref.current);

    let componentStack = normalizeCodeLocInfo(
      computeComponentStackForErrorReporting(reactTag),
    );

    if (__DEV__) {
      expect(componentStack).toBe(
        '\n' +
          '    in View (at **)\n' +
          '    in FunctionalComponent (at **)\n' +
          '    in ClassComponent (at **)',
      );
    } else {
      expect(componentStack).toBe(
        '\n' +
          '    in View\n' +
          '    in FunctionalComponent\n' +
          '    in ClassComponent',
      );
    }
  });
});
