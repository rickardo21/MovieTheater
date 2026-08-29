

export const enrichWithHeroImages = async (
    items: any[],
    getHeroImages: (id: number) => Promise<{ backdrop: any; logo: any }>,
): Promise<any[]> => {

    const results = await Promise.allSettled(
        items.map(async (item) => {
            try {
                const { backdrop, logo } = await getHeroImages(item.id);
                return {
                    ...item,
                    bg: backdrop?.file_path ?? item.backdrop_path ?? null,
                    logo: logo?.file_path ?? null,
                };
            } catch {
                return {
                    ...item,
                    bg: item.backdrop_path ?? null,
                    logo: null,
                };
            }
        })
    );
    return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
        .map((r) => r.value);
};
