// Simple in-memory store for demo mode (no DB required)

function nowIso() {
	return new Date().toISOString();
}

const demoInstitution = {
	_id: "inst-1",
	name: "Demo Institution",
	eiin: "DEMO01",
	email: "inst1@gmail.com",
	slug: "demo-institution",
	phone: "",
	address: "",
	description: "",
	createdAt: nowIso(),
	updatedAt: nowIso(),
};

const demoInstructor = {
	_id: "instr-1",
	name: "Demo Instructor",
	email: "instructor1@gmail.com",
	createdAt: nowIso(),
	updatedAt: nowIso(),
};

const demoStudent = {
	_id: "student-1",
	name: "Demo Student",
	email: "student1@gmail.com",
	createdAt: nowIso(),
	updatedAt: nowIso(),
};

const demoRooms = [
	{
		_id: "room-1",
		room_name: "Intro to Demo",
		description: "A sample course room for demonstration",
		institution: demoInstitution._id,
		maxCapacity: 50,
		students: [demoStudent._id],
		instructors: [demoInstructor._id],
		createdAt: nowIso(),
		updatedAt: nowIso(),
	},
];

const store = {
	institution: demoInstitution,
	instructors: [demoInstructor],
	students: [demoStudent],
	rooms: [...demoRooms],
	materialsByRoom: {
		"room-1": [],
	},
	forumByRoom: {
		"room-1": [],
	},
	assessmentsByRoom: {
		"room-1": [],
	},
};

export function getDemoStore() {
	return store;
}

export function ensureDemoInitialized() {
	// no-op for now; placeholder if we ever need to reset
	return store;
}


