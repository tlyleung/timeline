'use client';

import { EventType } from '@/data';
import { UTCDate } from '@date-fns/utc';
import clsx from 'clsx';
import {
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  format,
  getDaysInMonth,
  startOfDay,
  startOfHour,
  startOfMonth,
} from 'date-fns';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  VariableSizeGrid as Grid,
  GridChildComponentProps,
} from 'react-window';

const CATEGORY_COLOURS = { Art: 'red', Music: 'green', Theatre: 'blue' };
const COLUMN_COUNT = { Hour: 365 * 24, Day: 366, Month: 12 };

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

const Cell = ({ style, data }: GridChildComponentProps) => (
  <div
    style={style}
    className={clsx(
      // Base layout
      'z-10 box-border content-center items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap',
      // Border
      'border-b border-r border-zinc-950/5 border-l-zinc-950/5 px-2 dark:border-white/5 dark:border-r-white/5',
      // Background
      'lg:bg-white dark:bg-zinc-900',
    )}
  >
    {data}
  </div>
);

const Event = ({
  category,
  style,
  children,
  event,
  isFullWidth,
  setEvent,
}: {
  category: 'Art' | 'Music' | 'Theatre';
  style: React.CSSProperties;
  children: React.ReactNode;
  event: EventType;
  isFullWidth: boolean;
  setEvent: (event: EventType) => void;
}) => {
  const colour = CATEGORY_COLOURS[category];
  return (
    <div
      style={style}
      className={clsx(
        // Base layout
        `absolute z-10 box-border flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap text-center text-${colour}-700 group-data-[hover]:bg-${colour}-500/25 dark:text-${colour}-400 dark:group-data-[hover]:bg-${colour}-500/20`,
        // Background
        `bg-${colour}-500/15 dark:bg-${colour}-500/10`,
      )}
      onClick={() => {
        setEvent(event);
      }}
    >
      {children} {isFullWidth ? 'True' : 'False'}
    </div>
  );
};

const addFractionalHours = (date: Date, fractionalHours: number): Date => {
  return new UTCDate(date.getTime() + fractionalHours * MILLISECONDS_PER_HOUR);
};

const addFractionalDays = (date: Date, fractionalDays: number): Date => {
  return new UTCDate(date.getTime() + fractionalDays * MILLISECONDS_PER_DAY);
};

const addFractionalMonths = (date: Date, fractionalMonths: number): Date => {
  const wholeMonths = Math.floor(fractionalMonths);
  let fractionalMonth = fractionalMonths - wholeMonths;

  // Add the integer part of months
  let resultDate = addMonths(date, wholeMonths);

  // Calculate how many fractional days the current month can accommodate
  let daysInMonth = getDaysInMonth(resultDate);
  const remainingTimeInCurrentMonth =
    endOfMonth(resultDate).getTime() - resultDate.getTime();
  const maxFractionalInCurrentMonth =
    remainingTimeInCurrentMonth / daysInMonth / MILLISECONDS_PER_DAY;

  // If the fractional month doesn't fit in the remaining days of the current month
  if (fractionalMonth > maxFractionalInCurrentMonth) {
    fractionalMonth -= maxFractionalInCurrentMonth;
    resultDate = startOfMonth(addMonths(resultDate, 1));
    daysInMonth = getDaysInMonth(resultDate);
  }

  return addFractionalDays(resultDate, fractionalMonth * daysInMonth);
};

// Helper to get column index from date
const getColumnIndex = (
  date: Date,
  anchorDate: Date,
  view: 'Hour' | 'Day' | 'Month',
): number => {
  const offsetIndex = COLUMN_COUNT[view] / 2;
  switch (view) {
    case 'Hour':
      return (
        offsetIndex +
        (date.getTime() - startOfHour(anchorDate).getTime()) /
          MILLISECONDS_PER_HOUR
      );
    case 'Day':
      return (
        offsetIndex +
        (date.getTime() - startOfDay(anchorDate).getTime()) /
          MILLISECONDS_PER_DAY
      );
    case 'Month':
      const wholeMonths = differenceInCalendarMonths(
        date,
        startOfMonth(anchorDate),
      );
      const startOfTargetMonth = startOfMonth(
        addMonths(startOfMonth(anchorDate), wholeMonths),
      );
      const endOfTargetMonth = endOfMonth(startOfTargetMonth);
      const remainingTimeInTargetMonth =
        date.getTime() - startOfTargetMonth.getTime();
      const timeInTargetMonth =
        endOfTargetMonth.getTime() - startOfTargetMonth.getTime();
      return (
        offsetIndex -
        wholeMonths +
        remainingTimeInTargetMonth / timeInTargetMonth
      );
    default:
      return offsetIndex;
  }
};

// Helper to get date from fractional columnIndex
const getDate = (
  columnIndex: number,
  anchorDate: Date,
  view: 'Hour' | 'Day' | 'Month',
): Date => {
  const offsetIndex = COLUMN_COUNT[view] / 2;
  switch (view) {
    case 'Hour':
      return addFractionalHours(
        startOfHour(anchorDate),
        columnIndex - offsetIndex,
      );
    case 'Day':
      return addFractionalDays(
        startOfDay(anchorDate),
        columnIndex - offsetIndex,
      );
    case 'Month': {
      return addFractionalMonths(
        startOfMonth(anchorDate),
        columnIndex - offsetIndex,
      );
    }
    default:
      return anchorDate;
  }
};

// Header functions for each view
const getHeader = (
  columnIndex: number,
  anchorDate: Date,
  view: 'Hour' | 'Day' | 'Month',
): string => {
  const date = getDate(columnIndex, anchorDate, view);
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
const getLabel = (
  columnIndex: number,
  anchorDate: Date,
  view: 'Hour' | 'Day' | 'Month',
): string => {
  const date = getDate(columnIndex, anchorDate, view);
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

export function Timeline({
  height,
  width,
  rowHeight,
  indexWidth,
  columnWidth,
  overscanCount,
  events,
  view,
  setEvent,
}: {
  height: number;
  width: number;
  rowHeight: number;
  indexWidth: number;
  columnWidth: number;
  overscanCount: number;
  events: EventType[];
  view: 'Hour' | 'Day' | 'Month';
  setEvent: (event: EventType) => void;
}) {
  const [scroll, setScroll] = useState({ left: 0, top: 0 });
  const [currentDate, setCurrentDate] = useState<Date>(new UTCDate());
  const gridRef = useRef<Grid>(null);

  const anchorDate = new UTCDate();

  const venues = useMemo(
    () => Array.from(new Set(events.map((event) => event.venue))).sort(),
    [events, view],
  );

  const rowCount = venues.length; // not including sticky cells
  const columnCount = COLUMN_COUNT[view]; // not including sticky cells

  const fromColumn = scroll.left / columnWidth; // minimum column index not including sticky cells
  const toColumn = (scroll.left + width - indexWidth) / columnWidth; // maximum column index not including sticky cells (not inclusive)
  const fromRow = scroll.top / rowHeight; // minimum row index not including sticky cells
  const toRow = (scroll.top + height - rowHeight) / rowHeight; // maximum row index not including sticky cells (not inclusive)

  useEffect(() => {
    const columnIndex = (fromColumn + toColumn) / 2;
    const newCurrentDate = getDate(columnIndex, anchorDate, view);
    setCurrentDate(newCurrentDate);
    console.log({ type: 'row', from: fromRow, to: toRow });
    console.log({ type: 'column', from: fromColumn, to: toColumn });
    console.log(newCurrentDate.toUTCString());
  }, [scroll.left, view]);

  const handleScroll = useCallback(
    ({ scrollLeft, scrollTop }: { scrollLeft: number; scrollTop: number }) => {
      setScroll({ left: scrollLeft, top: scrollTop });
    },
    [],
  );

  const innerElementType = forwardRef(
    (
      {
        children,
        style,
      }: { children: React.ReactNode; style: React.CSSProperties },
      ref: React.Ref<HTMLDivElement>,
    ) => {
      const newChildren = (
        children as React.ReactElement<GridChildComponentProps<any>>[]
      ).filter(
        (child) => child.props.rowIndex > 0 && child.props.columnIndex > 0,
      );

      // Add top-left corner sticky cell
      // console.log(`0:0`);
      newChildren.push(
        <Cell
          rowIndex={0}
          columnIndex={0}
          data={getLabel(fromColumn, anchorDate, view)}
          style={{
            display: 'inline-flex',
            position: 'sticky',
            width: indexWidth,
            height: rowHeight,
            top: 0,
            left: 0,
            zIndex: 30,
          }}
        />,
      );

      // Add sticky header row cells
      for (
        let col = Math.floor(fromColumn);
        col < Math.min(Math.ceil(toColumn), columnCount);
        col++
      ) {
        const marginLeft =
          col === Math.floor(fromColumn) ? columnWidth * col : undefined;

        // console.log(`0:${col + 1}`);
        newChildren.push(
          <Cell
            rowIndex={0}
            columnIndex={col + 1}
            data={getHeader(col, anchorDate, view)}
            style={{
              display: 'inline-flex',
              position: 'sticky',
              width: columnWidth,
              height: rowHeight,
              top: 0,
              marginLeft,
              zIndex: 20,
            }}
          />,
        );
      }

      // Add sticky left column cells
      for (
        let row = Math.floor(fromRow);
        row < Math.min(Math.ceil(toRow), rowCount);
        row++
      ) {
        const marginTop =
          row === Math.floor(fromRow) ? rowHeight * row : undefined;

        // console.log(`--${row + 1}:0`);
        newChildren.push(
          <Cell
            rowIndex={row + 1}
            columnIndex={0}
            data={venues[row]}
            style={{
              position: 'sticky',
              width: indexWidth,
              height: rowHeight,
              left: 0,
              marginTop,
              zIndex: 20,
            }}
          />,
        );
      }

      // Iterate through events and only add those that are visible on-screen
      events.forEach((event: EventType, index: number) => {
        const startTime = new UTCDate(event.start);
        const endTime = new UTCDate(event.end);

        // Calculate start and end columns based on day difference
        const startColumnIndex = getColumnIndex(startTime, anchorDate, view);
        const endColumnIndex = getColumnIndex(endTime, anchorDate, view);

        // Determine the row index by finding the venue’s position
        const rowIndex = venues.indexOf(event.venue) + 1;

        // Adjust the start and end columns to fit within the visible range (with overscan)
        const visibleStartColumn = Math.max(
          0,
          startColumnIndex,
          fromColumn - overscanCount,
        );
        const visibleEndColumn = Math.min(
          columnCount,
          endColumnIndex,
          toColumn + overscanCount,
        );

        // Skip this event if it is invalid or outside of the visible columns/rows
        if (
          visibleStartColumn >= visibleEndColumn ||
          startColumnIndex > toColumn ||
          endColumnIndex < fromColumn ||
          rowIndex < fromRow - overscanCount ||
          rowIndex > toRow + overscanCount
        ) {
          return;
        }

        // Add padding for overscan to keep label centered
        const paddingLeft =
          visibleStartColumn < fromColumn
            ? (fromColumn - visibleStartColumn) * columnWidth
            : 0;

        const paddingRight =
          visibleEndColumn > toColumn
            ? (visibleEndColumn - toColumn) * columnWidth
            : 0;

        // Determine if the event spans the full visible width
        const isFullWidth =
          startColumnIndex <= fromColumn && endColumnIndex >= toColumn;

        // const magicNumber = { Hour: 0, Day: -0.5, Month: -0.5 };
        newChildren.push(
          <Event
            key={`event-${index}`}
            category={event.category}
            event={event}
            isFullWidth={isFullWidth}
            setEvent={setEvent}
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
          {newChildren}
        </div>
      );
    },
  );

  return (
    <>
      <div
        style={{ right: `calc(50% - 120px)` }}
        className={`absolute top-0 z-50 h-full w-px bg-zinc-300`}
      ></div>
      <Grid
        ref={gridRef}
        className="timeline"
        height={height}
        width={width}
        rowCount={rowCount + 1}
        rowHeight={() => rowHeight}
        overscanRowCount={overscanCount}
        columnCount={columnCount + 1}
        columnWidth={(index) => (index === 0 ? indexWidth : columnWidth)}
        overscanColumnCount={overscanCount}
        innerElementType={innerElementType}
        onScroll={handleScroll}
        initialScrollLeft={indexWidth + (columnCount / 2) * columnWidth}
      >
        {Cell}
      </Grid>
    </>
  );
}
