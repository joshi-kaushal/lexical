/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './board.css';

import React, {memo, useCallback, useEffect, useState} from 'react';

import BoardTitleContainer from './boardTitleContainer';
import Column from './column';
import {useHorizontalOverflow} from './hooks/useHorizontalOverflow';
import Modal from './modal';
import {CardType, ColumnType, ModalPositionType} from './types';

const Board: React.FC = () => {
  const [boardTitle, setBoardTitle] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [columns, setColumns] = useState<ColumnType[]>([
    {cards: [], id: 'todo', title: 'To Do'},
    {cards: [], id: 'ongoing', title: 'Ongoing'},
    {cards: [], id: 'done', title: 'Done'},
  ]);
  const [isCardDragging, setIsCardDragging] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<{
    cardId: string;
    sourceColumnId: string;
  } | null>(null);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [modalPosition, setModalPosition] =
    useState<ModalPositionType>(undefined);

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

      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((column) => {
          if (column.id === draggedCard.sourceColumnId) {
            return {
              ...column,
              cards: column.cards.filter(
                (card) => card.id !== draggedCard.cardId,
              ),
            };
          }
          if (column.id === targetColumnId) {
            const cardToMove = prevColumns
              .find((col) => col.id === draggedCard.sourceColumnId)
              ?.cards.find((card) => card.id === draggedCard.cardId);

            return cardToMove
              ? {...column, cards: [...column.cards, cardToMove]}
              : column;
          }
          return column;
        });
        return newColumns;
      });

      setDraggedCard(null);
    },
    [draggedCard],
  );

  const addCard = useCallback((columnId: string, content: string) => {
    const newCard: CardType = {
      content,
      id: Math.random().toString(36).substr(2, 9),
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId ? {...col, cards: [...col.cards, newCard]} : col,
      ),
    );
  }, []);

  const addColumn = useCallback((title: string) => {
    const newColumn: ColumnType = {
      cards: [],
      id: Math.random().toString(36).substr(2, 9),
      title,
    };

    setColumns((prevColumns) => [...prevColumns, newColumn]);
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
      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column.id === columnId ? {...column, cards: updatedCards} : column,
        ),
      );
    },
    [],
  );

  const updateCardContent = useCallback(
    (cardId: string, editedContent: string) => {
      setColumns((prevColumns) =>
        prevColumns.map((column) => ({
          ...column,
          cards: column.cards.map((card) =>
            card.id === cardId ? {...card, content: editedContent} : card,
          ),
        })),
      );
    },
    [],
  );

  const updateColumnName = useCallback((columnId: string, newName: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) =>
        column.id === columnId ? {...column, title: newName} : column,
      ),
    );
  }, []);

  const deleteColumn = useCallback(
    (columnId: string) => {
      if (columns.length === 1) {
        alert('you must have at least one column');
        return;
      }

      setColumns((prevColumns) =>
        prevColumns.filter((column) => column.id !== columnId),
      );
    },
    [columns],
  );

  useEffect(() => {
    const savedData = localStorage.getItem('boardData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setBoardTitle(parsedData.boardTitle);
      setColumns(parsedData.columns);
    } else {
      setColumns([
        {cards: [], id: 'todo', title: 'To Do'},
        {cards: [], id: 'ongoing', title: 'Ongoing'},
        {cards: [], id: 'done', title: 'Done'},
      ]);
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
        boardTitle={boardTitle}
        setBoardTitle={setBoardTitle}
        setIsEditing={setIsEditing}
        openColumnModal={openColumnModal}
      />
      <div
        ref={scrollContainerRef}
        className={`${
          isOverflowing ? 'overflow-x-auto' : 'overflow-x-hidden'
        } relative my-0 flex flex-1`}>
        {columns.map((column) => (
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
