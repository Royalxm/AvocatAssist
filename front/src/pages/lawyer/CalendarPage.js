import React, { useState, useEffect, useRef } from 'react';
import api from '../../utils/api'; // Corrected import
// Placeholder for a calendar library component
// import FullCalendar from '@fullcalendar/react'; // Example
// import dayGridPlugin from '@fullcalendar/daygrid'; // Example plugin
// import timeGridPlugin from '@fullcalendar/timegrid'; // Example plugin
// import interactionPlugin from '@fullcalendar/interaction'; // Example plugin for clicking/dragging

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const calendarRef = useRef(null); // Ref for accessing calendar API if needed

    // Fetch events when the component mounts or view range changes
    // This needs to be adapted based on the chosen calendar library's API
    // For now, fetch all events on mount (replace with range fetching later)
    useEffect(() => {
        fetchEvents(); // Fetch initial events
    }, []);

    const fetchEvents = async (fetchInfo = null) => {
        setLoading(true);
        setError(null);
        // Determine date range based on calendar view (if available)
        // const start = fetchInfo?.startStr || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
        // const end = fetchInfo?.endStr || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
        // Simplified fetch for now:
        const start = new Date(Date.UTC(2020, 0, 1)).toISOString(); // Fetch a wide range initially
        const end = new Date(Date.UTC(2030, 0, 1)).toISOString();

        try {
            const response = await api.get('/calendar/events', { // Use 'api'
                params: { start, end }
            });
            // Map backend events to the format expected by the calendar library
            const formattedEvents = response.data.events.map(event => ({
                id: event.id,
                title: event.title,
                start: event.start, // Ensure these are valid ISO strings or Date objects
                end: event.end,
                allDay: event.allDay,
                // Add other properties like description, location if needed by the calendar display/popover
                extendedProps: {
                    description: event.description,
                    location: event.location
                }
            }));
            setEvents(formattedEvents);
        } catch (err) {
            console.error("Error fetching calendar events:", err);
            setError(err.response?.data?.message || 'Failed to load calendar events.');
        } finally {
            setLoading(false);
        }
    };

    // --- Event Handlers (to be implemented based on library) ---

    // Handle clicking on a date/time slot to add an event
    const handleDateSelect = (selectInfo) => {
        // Example: Open a modal to create a new event
        console.log('Date selected:', selectInfo);
        // let title = prompt('Please enter a new title for your event');
        // let calendarApi = selectInfo.view.calendar;
        // calendarApi.unselect(); // clear date selection
        // if (title) {
        //     // Call API to create event, then refetch or add event locally
        // }
    };

    // Handle clicking on an existing event
    const handleEventClick = (clickInfo) => {
        // Example: Open a modal to view/edit/delete the event
        console.log('Event clicked:', clickInfo.event);
        // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
        //     // Call API to delete event, then remove from local state
        // }
    };

    // Handle dragging and dropping an event
    const handleEventDrop = (dropInfo) => {
        // Example: Call API to update event's start/end time
        console.log('Event dropped:', dropInfo.event);
        // Call API to update event dates, revert on failure
    };

     // Handle resizing an event
    const handleEventResize = (resizeInfo) => {
        // Example: Call API to update event's end time
        console.log('Event resized:', resizeInfo.event);
         // Call API to update event end date, revert on failure
    };


    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Mon Calendrier</h1>

            {error && (
                <div className="p-4 mb-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                {loading && <p>Chargement du calendrier...</p>}
                {/* Placeholder for the actual Calendar component */}
                <div className="h-[600px] border rounded p-4 text-center text-gray-500">
                    <p>Intégration du composant Calendrier (ex: FullCalendar) ici.</p>
                    <p className="mt-4">Fonctionnalités à implémenter :</p>
                    <ul className="list-disc list-inside text-left max-w-md mx-auto mt-2 text-sm">
                        <li>Affichage des événements récupérés depuis l'API</li>
                        <li>Création de nouveaux événements (clic/sélection)</li>
                        <li>Modification des événements (clic/drag/resize)</li>
                        <li>Suppression des événements</li>
                    </ul>
                     {/* Example FullCalendar integration (requires installation and setup) */}
                    {/*
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        initialView='dayGridMonth'
                        editable={true}
                        selectable={true}
                        selectMirror={true}
                        dayMaxEvents={true}
                        weekends={true} // or false based on preference
                        events={events} // Pass fetched events
                        select={handleDateSelect}
                        eventClick={handleEventClick}
                        eventDrop={handleEventDrop}
                        eventResize={handleEventResize}
                        // datesSet={(dateInfo) => fetchEvents(dateInfo)} // Refetch when view/date range changes
                        height="auto" // Adjust height as needed
                        locale="fr" // Set locale if needed
                        buttonText={{ // French button text example
                            today:    'Aujourd\'hui',
                            month:    'Mois',
                            week:     'Semaine',
                            day:      'Jour',
                            list:     'Liste'
                        }}
                        ref={calendarRef}
                    />
                    */}
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;