// lib/allocation.ts

export interface Candidate {
    full_name: string;
    votes: number;
    is_reserved_category: boolean;
    is_women_quota: boolean;
    id: string;
}

// Added interface for the return structure
export interface SubstitutionResult {
    electedList: Candidate[];
    isTie: boolean;
}

export function performSubstitution(elected: Candidate[], unelected: Candidate[]): SubstitutionResult {
    const checkCompliance = (list: Candidate[]) => {
        const res = list.filter(c => c.is_reserved_category).length;
        const womTot = list.filter(c => c.is_women_quota).length;
        const womOpen = list.filter(c => c.is_women_quota && !c.is_reserved_category).length;
        const womRes = list.filter(c => c.is_women_quota && c.is_reserved_category).length;
        return { res: res >= 5, womTot: womTot >= 4, womOpen: womOpen >= 2, womRes: womRes >= 2 };
    };

    const isProtected = (c: Candidate, list: Candidate[]) => {
        const remaining = list.filter(item => item.id !== c.id);
        const comp = checkCompliance(remaining);
        return Object.values(comp).includes(false);
    };

    let currentList = [...elected];
    let pool = [...unelected];

    while (Object.values(checkCompliance(currentList)).includes(false)) {
        let comp = checkCompliance(currentList);
        
        let hero: Candidate | undefined;
        if (!comp.res) hero = pool.find(c => c.is_reserved_category);
        else if (!comp.womTot) hero = pool.find(c => c.is_women_quota);

        if (hero) {
            let victim = currentList
                .filter(c => !isProtected(c, currentList))
                .sort((a, b) => a.votes - b.votes)[0];

            if (victim) {
                currentList = currentList.filter(c => c.id !== victim.id);
                currentList.push(hero);
                pool = pool.filter(c => c.id !== hero!.id);
                pool.push(victim);
            } else break; 
        } else break;
    }

    // Detect tie at the boundary
    const isTie = unelected.length > 0 && elected.length > 0 && 
                  elected[elected.length - 1].votes === unelected[0].votes;

    return { 
        electedList: currentList,
        isTie
    };
}