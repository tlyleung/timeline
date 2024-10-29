'use client';

import { EventType } from '@/data';
import { UTCDate } from '@date-fns/utc';
import {
  addDays,
  addHours,
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  format,
  startOfDay,
  startOfHour,
  startOfMonth,
} from 'date-fns';
import React, {
  forwardRef,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  VariableSizeGrid as Grid,
  GridChildComponentProps,
} from 'react-window';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

const CELL_CLASS_NAME =
  'box-border content-center items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap border-b border-r border-zinc-950/5 border-l-zinc-950/5 px-2 lg:bg-white dark:border-white/5 dark:border-r-white/5 dark:bg-zinc-900';

const Cell = ({ style }: GridChildComponentProps) => (
  <div style={style} className={CELL_CLASS_NAME}></div>
);

const Event = ({
  category,
  style,
  children,
  event,
  isFullWidth,
  setEvent,
  setIsOpen,
}: {
  category: string;
  style: React.CSSProperties;
  children: React.ReactNode;
  event: EventType;
  isFullWidth: boolean;
  setEvent: (event: EventType) => void;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  let colour;
  switch (category) {
    case 'Art':
      colour = 'red';
      break;
    case 'Music':
      colour = 'green';
      break;
    case 'Theatre':
      colour = 'blue';
      break;
    default:
      colour = 'zinc';
      break;
  }

  return (
    <div
      style={style}
      className={`absolute z-10 box-border flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap bg-${colour}-500/15 text-center text-${colour}-700 group-data-[hover]:bg-${colour}-500/25 dark:bg-${colour}-500/10 dark:text-${colour}-400 dark:group-data-[hover]:bg-${colour}-500/20`}
      onClick={() => {
        setEvent(event);
        setIsOpen(true);
      }}
    >
      {children}
    </div>
  );
};

// Helper to get a date offset from today
const getOffsetDate = (index: number, view: string) => {
  const baseDate = new UTCDate();
  switch (view) {
    case 'Hour':
      return addHours(startOfHour(baseDate), index - 500);
    case 'Day':
      return addDays(startOfDay(baseDate), index - 500);
    case 'Month':
      return addMonths(startOfMonth(baseDate), index - 500);
    default:
      return baseDate;
  }
};

// Header functions for each view
const getHeader = (index: number, view: string) => {
  const date = getOffsetDate(index, view);
  switch (view) {
    case 'Hour':
      return format(date, 'h a');
    case 'Day':
      return format(date, 'EEE d');
    case 'Month':
      return format(date, 'MMM');
    default:
      return '';
  }
};

// Label functions for each view
const getLabel = (index: number, view: string) => {
  const date = getOffsetDate(index, view);
  switch (view) {
    case 'Hour':
      return format(date, 'd MMM yyyy');
    case 'Day':
      return format(date, 'MMM yyyy');
    case 'Month':
      return format(date, 'yyyy');
    default:
      return '';
  }
};

// Function to calculate time differences in each view
const getTimeDifference = (start: Date, end: Date, view: string) => {
  switch (view) {
    case 'Month': // Note: months have different lengths
      const wholeMonths = differenceInCalendarMonths(end, start);
      const startOfEndMonth = startOfMonth(addMonths(start, wholeMonths));
      const endOfEndMonth = endOfMonth(startOfEndMonth);
      const remainingMs = end.getTime() - startOfEndMonth.getTime();
      const endMonthMs = endOfEndMonth.getTime() - startOfEndMonth.getTime();
      return wholeMonths + remainingMs / endMonthMs;
    case 'Day':
      return (end.getTime() - start.getTime()) / MILLISECONDS_PER_DAY;
    case 'Hour':
      return (end.getTime() - start.getTime()) / MILLISECONDS_PER_HOUR;
    default:
      return 0;
  }
};

export function Timeline({
  height,
  width,
  rowHeight,
  indexWidth,
  columnWidth,
  overscanColumnCount,
  events,
  view,
  setEvent,
  setIsOpen,
}: {
  height: number;
  width: number;
  rowHeight: number;
  indexWidth: number;
  columnWidth: number;
  overscanColumnCount: number;
  events: EventType[];
  view: string;
  setEvent: (event: EventType) => void;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [scrollPos, setScrollPos] = useState({
    scrollLeft: 500 * columnWidth,
    scrollTop: 0,
  });
  const gridRef = useRef<Grid>(null);

  const venues = useMemo(
    () => Array.from(new Set(events.map((event) => event.venue))).sort(),
    [events],
  );

  const handleScroll = useCallback(
    ({ scrollLeft, scrollTop }: { scrollLeft: number; scrollTop: number }) => {
      setScrollPos({ scrollLeft, scrollTop });
    },
    [],
  );

  const fromColumn = scrollPos.scrollLeft / columnWidth;
  const toColumn = (scrollPos.scrollLeft + width) / columnWidth;
  const fromRow = scrollPos.scrollTop / rowHeight;
  const toRow = (scrollPos.scrollTop + height) / rowHeight;

  const innerElementType = forwardRef(
    (
      {
        children,
        style,
      }: { children: React.ReactNode; style: React.CSSProperties },
      ref: React.Ref<HTMLDivElement>,
    ) => {
      const cells = (
        children as React.ReactElement<GridChildComponentProps<any>>[]
      ).filter(
        (child) => child.props.rowIndex > 0 && child.props.columnIndex > 0,
      );

      // Add top-left corner sticky cell
      cells.push(
        <div
          key="0:0"
          className={`${CELL_CLASS_NAME} border-t lg:border-t-0`}
          style={{
            display: 'inline-flex',
            position: 'sticky',
            width: indexWidth,
            height: rowHeight,
            top: 0,
            left: 0,
            zIndex: 30,
          }}
        >
          {getLabel(Math.floor(fromColumn + 2), view)}
        </div>,
      );

      // Add sticky header row cells
      for (
        let col = Math.floor(fromColumn);
        col <= Math.ceil(toColumn);
        col++
      ) {
        const marginLeft =
          col === Math.floor(fromColumn) ? columnWidth * (col - 1) : undefined;

        cells.push(
          <div
            key={`0:${col}`}
            className={`${CELL_CLASS_NAME} border-t lg:border-t-0`}
            style={{
              display: 'inline-flex',
              position: 'sticky',
              width: columnWidth,
              height: rowHeight,
              top: 0,
              marginLeft,
              zIndex: 20,
            }}
          >
            {getHeader(col - 1, view)}
          </div>,
        );
      }

      // Add sticky left column cells
      for (
        let row = Math.max(1, Math.floor(fromRow));
        row <= Math.min(toRow, venues.length);
        row++
      ) {
        const marginTop =
          row === Math.floor(fromRow) ? rowHeight * (row - 1) : undefined;

        cells.push(
          <div
            key={`${row}:0`}
            className={CELL_CLASS_NAME}
            style={{
              position: 'sticky',
              width: indexWidth,
              height: rowHeight,
              left: 0,
              marginTop,
              zIndex: 20,
            }}
          >
            {venues[Math.floor(row - 1)]}
          </div>,
        );
      }

      const anchorDate = getOffsetDate(0, view);

      // Iterate through events and only add those that are visible on-screen
      events.forEach((event: EventType, index: number) => {
        const startTime = new Date(event.start);
        const endTime = new Date(event.end);

        // Calculate start and end columns based on day difference
        const startColumnIndex = getTimeDifference(anchorDate, startTime, view);
        const endColumnIndex = getTimeDifference(anchorDate, endTime, view);

        // Determine the row index by finding the venue’s position
        const rowIndex = venues.indexOf(event.venue) + 1; // +1 because row 0 is the header

        // Adjust the start and end columns to fit within the visible range (with overscan)
        const visibleStartColumn = Math.max(
          startColumnIndex,
          fromColumn - overscanColumnCount,
        );
        const visibleEndColumn = Math.min(
          endColumnIndex,
          toColumn - indexWidth / columnWidth + overscanColumnCount,
        );

        // Add padding for overscan to keep label centered
        const paddingLeft =
          visibleStartColumn < fromColumn
            ? (fromColumn - visibleStartColumn) * columnWidth
            : 0;

        const paddingRight =
          visibleEndColumn > toColumn - indexWidth / columnWidth
            ? (visibleEndColumn - toColumn + indexWidth / columnWidth) *
              columnWidth
            : 0;

        // Skip this event if it is invalid or outside of the visible columns/rows
        if (
          visibleStartColumn >= visibleEndColumn ||
          startColumnIndex > toColumn ||
          endColumnIndex < fromColumn ||
          rowIndex < fromRow ||
          rowIndex > toRow
        ) {
          return;
        }

        const isFullWidth =
          startColumnIndex <= fromColumn &&
          endColumnIndex >= toColumn - indexWidth / columnWidth;

        cells.push(
          <Event
            key={`event-${index}`}
            category={event.category}
            event={event}
            isFullWidth={isFullWidth}
            setEvent={setEvent}
            setIsOpen={setIsOpen}
            style={{
              width: (visibleEndColumn - visibleStartColumn) * columnWidth,
              height: rowHeight / 2,
              top: rowIndex * rowHeight + rowHeight / 4,
              left: indexWidth + visibleStartColumn * columnWidth,
              paddingLeft,
              paddingRight,
            }}
          >
            {event.title}
          </Event>,
        );
      });

      return (
        <div ref={ref} style={style}>
          {cells}
        </div>
      );
    },
  );

  return (
    <Grid
      ref={gridRef}
      className="timeline"
      height={height}
      width={width}
      columnCount={1000}
      columnWidth={(index) => (index === 0 ? indexWidth : columnWidth)}
      rowCount={venues.length + 1}
      rowHeight={() => rowHeight}
      initialScrollLeft={500 * columnWidth}
      innerElementType={innerElementType}
      onScroll={handleScroll}
      overscanColumnCount={overscanColumnCount}
    >
      {Cell}
    </Grid>
  );
}
