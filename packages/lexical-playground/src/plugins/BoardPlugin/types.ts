/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

export interface CardType {
  id: string;
  content: string;
}

export interface ColumnType {
  id: string;
  title: string;
  cards: CardType[];
}

export type ModalPositionType =
  | {
      top: number;
      left: number;
    }
  | undefined;
