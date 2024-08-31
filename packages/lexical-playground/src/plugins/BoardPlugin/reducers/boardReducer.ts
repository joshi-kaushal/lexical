/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {CardType, ColumnType} from '../types';

export type Action =
  | {type: 'SET_BOARD_TITLE'; payload: string}
  | {type: 'SET_COLUMNS'; payload: ColumnType[]}
  | {type: 'ADD_COLUMN'; payload: ColumnType}
  | {type: 'DELETE_COLUMN'; payload: string}
  | {type: 'ADD_CARD'; payload: {columnId: string; card: CardType}}
  | {type: 'UPDATE_CARD_CONTENT'; payload: {cardId: string; content: string}}
  | {type: 'UPDATE_COLUMN_NAME'; payload: {columnId: string; newName: string}}
  | {type: 'DELETE_CARD'; payload: {columnId: string; cardId: string}};

export const BOARD_INITIAL_STATE = {
  boardTitle: '',
  columns: [
    {cards: [] as CardType[], id: 'todo', title: 'To Do'},
    {cards: [] as CardType[], id: 'ongoing', title: 'Ongoing'},
    {cards: [] as CardType[], id: 'done', title: 'Done'},
  ],
};

export const reducer = (state: typeof BOARD_INITIAL_STATE, action: Action) => {
  switch (action.type) {
    case 'SET_BOARD_TITLE':
      return {...state, boardTitle: action.payload};
    case 'SET_COLUMNS':
      return {...state, columns: action.payload};
    case 'ADD_COLUMN':
      return {...state, columns: [...state.columns, action.payload]};

    case 'DELETE_COLUMN':
      return {
        ...state,
        columns: state.columns.filter((col) => col.id !== action.payload),
      };
    case 'ADD_CARD':
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === action.payload.columnId
            ? {...col, cards: [...col.cards, action.payload.card]}
            : col,
        ),
      };
    case 'UPDATE_CARD_CONTENT':
      return {
        ...state,
        columns: state.columns.map((col) => ({
          ...col,
          cards: col.cards.map((card: CardType) =>
            card.id === action.payload.cardId
              ? {...card, content: action.payload.content}
              : card,
          ),
        })),
      };
    case 'UPDATE_COLUMN_NAME':
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === action.payload.columnId
            ? {...col, title: action.payload.newName}
            : col,
        ),
      };
    case 'DELETE_CARD':
      return {
        ...state,
        columns: state.columns.map((col) =>
          col.id === action.payload.columnId
            ? {
                ...col,
                cards: col.cards.filter(
                  (card) => card.id !== action.payload.cardId,
                ),
              }
            : col,
        ),
      };
    default:
      return state;
  }
};
