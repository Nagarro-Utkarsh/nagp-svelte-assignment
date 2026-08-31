import { loadPersisted, savePersisted } from '$lib/storage';
import { DAYS, MEALS, type Day, type Meal } from '$lib/types';

type WeekPlan = Record<Day, Record<Meal, string[]>>;

const KEY = 'rf:planner';

function emptyPlan(): WeekPlan {
	return Object.fromEntries(
		DAYS.map((day) => [day, Object.fromEntries(MEALS.map((meal) => [meal, [] as string[]]))])
	) as WeekPlan;
}

function sanitize(value: unknown): WeekPlan {
	const plan = emptyPlan();
	const source = value as WeekPlan | undefined;

	for (const day of DAYS) {
		for (const meal of MEALS) {
			const ids = source?.[day]?.[meal];

			if (Array.isArray(ids)) {
				plan[day][meal] = ids.filter((id): id is string => typeof id === 'string');
			}
		}
	}

	return plan;
}

let week = $state<WeekPlan>(sanitize(loadPersisted<WeekPlan>(KEY, emptyPlan())));

function persist() {
	savePersisted(KEY, week);
}

export const planner = {
	get count() {
		return DAYS.reduce(
			(total, day) => total + MEALS.reduce((sum, meal) => sum + week[day][meal].length, 0),
			0
		);
	},
	ids(day: Day, meal: Meal) {
		return week[day][meal];
	},
	add(day: Day, meal: Meal, id: string) {
		if (week[day][meal].includes(id)) return;

		week[day][meal] = [...week[day][meal], id];
		persist();
	},
	remove(day: Day, meal: Meal, id: string) {
		week[day][meal] = week[day][meal].filter((current) => current !== id);
		persist();
	},
	purge(id: string) {
		for (const day of DAYS) {
			for (const meal of MEALS) {
				week[day][meal] = week[day][meal].filter((current) => current !== id);
			}
		}

		persist();
	},
	clear() {
		week = emptyPlan();
		persist();
	}
};
