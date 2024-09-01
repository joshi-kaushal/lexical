/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* eslint-disable sort-keys-fix/sort-keys-fix */

import React, {memo, useCallback, useEffect, useReducer, useState} from 'react';

import BoardTitleContainer from './boardTitleContainer';
import Column from './column';
import {useHorizontalOverflow} from './hooks/useHorizontalOverflow';
import Modal from './modal';
import {BOARD_INITIAL_STATE, reducer} from './reducers/boardReducer';
import {
  CardType,
  ColumnType,
  DraggedCardType,
  ModalPositionType,
} from './types';

const Board: React.FC = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [isCardDragging, setIsCardDragging] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<DraggedCardType>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] =
    useState<ModalPositionType>(undefined);

  const [state, dispatch] = useReducer(reducer, BOARD_INITIAL_STATE);
  const {boardTitle, columns} = state;

  const {scrollContainerRef, isOverflowing} = useHorizontalOverflow();

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, cardId: string, columnId: string) => {
      setIsCardDragging(cardId);
      setDraggedCard({cardId, sourceColumnId: columnId});
    },
    [],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
      setIsCardDragging(null);
      setIsCardDragging(targetColumnId);
      e.preventDefault();
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
      e.preventDefault();

      if (!draggedCard) {
        return;
      }

      if (draggedCard.sourceColumnId === targetColumnId) {
        setDraggedCard(null);
        return;
      }

      setIsCardDragging(null);

      const cardToMove = columns
        .find((col: ColumnType) => col.id === draggedCard.sourceColumnId)
        ?.cards.find((card: CardType) => card.id === draggedCard.cardId);

      if (cardToMove) {
        dispatch({
          type: 'DELETE_CARD',
          payload: {
            columnId: draggedCard.sourceColumnId,
            cardId: draggedCard.cardId,
          },
        });
        dispatch({
          type: 'ADD_CARD',
          payload: {columnId: targetColumnId, card: cardToMove},
        });
      }

      setDraggedCard(null);
    },
    [draggedCard, columns],
  );

  const addCard = useCallback((columnId: string, content: string) => {
    const newCard: CardType = {
      content,
      id: Date.now().toString(),
    };
    dispatch({type: 'ADD_CARD', payload: {columnId, card: newCard}});
  }, []);

  const addColumn = useCallback((title: string) => {
    const newColumn: ColumnType = {
      cards: [],
      id: Date.now().toString(),
      title,
    };
    dispatch({type: 'ADD_COLUMN', payload: newColumn});
  }, []);

  const openColumnModal = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({left: rect.left, top: rect.bottom});
    setIsColumnModalOpen(true);
  }, []);

  const openCardModal = useCallback((e: React.MouseEvent, columnId: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({left: rect.left, top: rect.bottom});
    setActiveColumnId(columnId);
    setIsCardModalOpen(true);
  }, []);

  const updateCards = useCallback(
    (columnId: string, updatedCards: CardType[]) => {
      dispatch({
        type: 'SET_COLUMNS',
        payload: columns.map((column: ColumnType) =>
          column.id === columnId ? {...column, cards: updatedCards} : column,
        ),
      });
    },
    [columns],
  );

  const updateCardContent = useCallback(
    (cardId: string, editedContent: string) => {
      dispatch({
        type: 'UPDATE_CARD_CONTENT',
        payload: {cardId, content: editedContent},
      });
    },
    [],
  );

  const updateColumnName = useCallback((columnId: string, newName: string) => {
    dispatch({type: 'UPDATE_COLUMN_NAME', payload: {columnId, newName}});
  }, []);

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (columns.length === 1) {
        alert('you must have at least one column');
        return;
      }
      dispatch({type: 'DELETE_COLUMN', payload: columnId});
    },
    [columns],
  );

  useEffect(() => {
    const savedData = localStorage.getItem('boardData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      dispatch({type: 'SET_BOARD_TITLE', payload: parsedData.boardTitle});
      dispatch({type: 'SET_COLUMNS', payload: parsedData.columns});
    }
  }, []);

  useEffect(() => {
    const dataToSave = {
      boardTitle,
      columns,
    };
    localStorage.setItem('boardData', JSON.stringify(dataToSave));
  }, [boardTitle, columns]);

  return (
    <div className="flex w-fit flex-col">
      <BoardTitleContainer
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        openColumnModal={openColumnModal}
      />
      <div
        ref={scrollContainerRef}
        className={`${
          isOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'
        } relative my-0 flex flex-1`}>
        {columns.map((column: ColumnType) => (
          <div
            className={
              isCardDragging === column.id ? ' rounded-lg bg-neutral-100' : ''
            }
            key={column.id}>
            <Column
              columnId={column.id}
              handleDragOver={(e) => handleDragOver(e, column.id)}
              handleDrop={handleDrop}
              title={column.title}
              cards={column.cards}
              handleDragStart={handleDragStart}
              openCardModal={openCardModal}
              updateCards={updateCards}
              updateCardContent={updateCardContent}
              updateColumnName={updateColumnName}
              deleteColumn={deleteColumn}
              isCardDragging={isCardDragging}
            />
          </div>
        ))}
      </div>
      <Modal
        isOpen={isColumnModalOpen}
        onClose={() => setIsColumnModalOpen(false)}
        onSubmit={addColumn}
        title="Add New Column"
        position={modalPosition}
      />
      <Modal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setActiveColumnId(null);
        }}
        onSubmit={(content) => {
          if (activeColumnId) {
            addCard(activeColumnId, content);
          }
        }}
        title="Add New Card"
        position={modalPosition}
      />
    </div>
  );
};

export default memo(Board);
