'use client';

import { Avatar } from '@/components/catalyst/avatar';
import { Button } from '@/components/catalyst/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/catalyst/dialog';
import { Input, InputGroup } from '@/components/catalyst/input';
import { Navbar } from '@/components/catalyst/navbar';
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from '@/components/catalyst/sidebar';
import { SidebarLayout } from '@/components/catalyst/sidebar-layout';
import { EventType, getEvents } from '@/data';
import { UTCDate } from '@date-fns/utc';
import {
  BuildingLibraryIcon,
  CalendarDaysIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  TicketIcon,
} from '@heroicons/react/20/solid';
import { format, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import React, { useEffect, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';

import { Timeline } from './timeline';

export default function Home() {
  const [category, setCategory] = useState('');
  const [event, setEvent] = useState<EventType>();
  const [events, setEvents] = useState<EventType[]>([]);
  const [filter, setFilter] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('Day');

  const fetchData = async () => {
    const data = await getEvents(category, filter);
    setEvents(data);
  };

  const formatDates = (event: EventType) => {
    const startDate = new UTCDate(event.start);
    const endDate = new UTCDate(event.end);

    if (isSameDay(startDate, endDate)) {
      return `${format(startDate, 'd MMMM yyyy, h:mm a')} – ${format(endDate, 'h:mm a')}`;
    } else if (isSameMonth(startDate, endDate)) {
      return `${format(startDate, 'd')}–${format(endDate, 'd MMMM yyyy')}`;
    } else if (isSameYear(startDate, endDate)) {
      return `${format(startDate, 'd MMMM')} – ${format(endDate, 'd MMMM yyyy')}`;
    } else {
      return `${format(startDate, 'd MMMM yyyy')} – ${format(endDate, 'd MMMM yyyy')}`;
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, filter]);
  return (
    <SidebarLayout
      navbar={<Navbar></Navbar>}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarItem>
              <Avatar
                initials="le"
                className="size-6 bg-zinc-900 text-white dark:bg-white dark:text-black"
              />
              <SidebarLabel>London Events</SidebarLabel>
            </SidebarItem>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input
                  name="filter"
                  placeholder="Filter events&hellip;"
                  aria-label="Filter"
                  onChange={(e) => setFilter(e.target.value)}
                />
              </InputGroup>
            </SidebarSection>
            <SidebarSection>
              <SidebarHeading>View</SidebarHeading>
              <SidebarItem
                current={view === 'Hour'}
                onClick={() => setView('Hour')}
              >
                {view === 'Hour' ? <CalendarDaysIcon /> : <CalendarIcon />}
                <SidebarLabel>Hour</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={view === 'Day'}
                onClick={() => setView('Day')}
              >
                {view === 'Day' ? <CalendarDaysIcon /> : <CalendarIcon />}
                <SidebarLabel>Day</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={view === 'Month'}
                onClick={() => setView('Month')}
              >
                {view === 'Month' ? <CalendarDaysIcon /> : <CalendarIcon />}
                <SidebarLabel>Month</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarSection>
              <SidebarHeading>Category</SidebarHeading>
              <SidebarItem
                current={category === ''}
                onClick={() => setCategory('')}
              >
                <TicketIcon />
                <SidebarLabel>All Events</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={category === 'Art'}
                onClick={() => setCategory('Art')}
              >
                <PaintBrushIcon />
                <SidebarLabel>Art</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={category === 'Music'}
                onClick={() => setCategory('Music')}
              >
                <MusicalNoteIcon />
                <SidebarLabel>Music</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={category === 'Theatre'}
                onClick={() => setCategory('Theatre')}
              >
                <BuildingLibraryIcon />
                <SidebarLabel>Theatre</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      <div className="absolute inset-0">
        <AutoSizer>
          {({ height, width }) => (
            <Timeline
              height={height}
              width={width}
              indexWidth={width >= 760 ? 240 : 120}
              columnWidth={120}
              rowHeight={60}
              overscanColumnCount={1}
              events={events}
              view={view}
              setEvent={setEvent}
              setIsOpen={setIsOpen}
            ></Timeline>
          )}
        </AutoSizer>
      </div>
      {event && (
        <Dialog open={isOpen} onClose={setIsOpen}>
          <DialogTitle>{event.title}</DialogTitle>
          <DialogDescription>{event.venue}</DialogDescription>
          <DialogBody>{formatDates(event)}</DialogBody>
          <DialogActions>
            <Button plain onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </SidebarLayout>
  );
}
