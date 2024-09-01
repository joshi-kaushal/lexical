/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {useEffect, useRef, useState} from 'react';

interface UseHorizontalOverflowProps {
  deps?: React.DependencyList;
}

export const useHorizontalOverflow = ({
  deps = [],
}: UseHorizontalOverflowProps = {}) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setIsOverflowing(container.scrollWidth > container.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, deps);

  return {isOverflowing, scrollContainerRef};
};
