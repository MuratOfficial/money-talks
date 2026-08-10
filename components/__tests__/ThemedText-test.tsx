import * as React from 'react';
import renderer, { act } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, () => {
  // React 19: рендер нужно оборачивать в act(), иначе toJSON() вернёт null.
  let tree: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  expect(tree!.toJSON()).toMatchSnapshot();
});
