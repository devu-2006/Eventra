import prisma from '../lib/prisma.js';

// ─────────────────────────────────────────
// CREATE EVENT — Club only
// ─────────────────────────────────────────
export const createEvent = async (req, res) => {
  const {
    title,
    description,
    venue,
    date,
    maxParticipants,
    organizerName,
    contactEmail,
    contactPhone,
  } = req.body;

  try {
    if (!title || !description || !venue || !date || !maxParticipants || !organizerName || !contactEmail) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        venue,
        date: new Date(date),
        maxParticipants: parseInt(maxParticipants),
        organizerName,
        contactEmail,
        contactPhone,
        creatorId: req.user.id,
      },
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────
// UPDATE EVENT — Club only (own events)
// ─────────────────────────────────────────
export const updateEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only update your own events' });
    }

    const updated = await prisma.event.update({
      where: { id },
      data: { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined },
    });

    res.status(200).json({ message: 'Event updated successfully', event: updated });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────
// DELETE EVENT — Club only (own events)
// ─────────────────────────────────────────
export const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({ where: { id } });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }

    await prisma.event.delete({ where: { id } });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────
// GET ALL EVENTS — with search & filters
// ─────────────────────────────────────────
export const getAllEvents = async (req, res) => {
  const { search, date, clubId } = req.query;

  try {
    const filters = {};

    // Search by title
    if (search) {
      filters.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Filter by date (events on or after the given date)
    if (date) {
      filters.date = {
        gte: new Date(date),
      };
    }

    // Filter by club
    if (clubId) {
      filters.creatorId = clubId;
    }

    const events = await prisma.event.findMany({
      where: filters,
      orderBy: { date: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    res.status(200).json({ events });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ─────────────────────────────────────────
// GET SINGLE EVENT — by id
// ─────────────────────────────────────────
export const getEventById = async (req, res) => {
  const { id } = req.params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};