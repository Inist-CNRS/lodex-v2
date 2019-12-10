import VALUE from './VALUE';

describe('VALUE', () => {
    it('should return value from args', async () => {
        const transformer = VALUE(null, [
            { name: 'value', value: 'a custom value' },
        ]);

        expect(await transformer({})).toEqual('a custom value');
    });

    it('should return error if args are not defined', async () => {
        const transformer = VALUE(null, [
            { name: 'value', value: 'a custom value' },
        ]);

        try {
            await transformer({});
        } catch (error) {
            expect(error.message).toEqual(
                'Invalid Argument for VALUE transformation',
            );
        }
    });
});
