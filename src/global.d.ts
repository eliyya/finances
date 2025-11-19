declare global {
    namespace Intl {
        interface DateTimeFormat {
            format(
                date: import('@js-temporal/polyfill').Temporal.PlainDate,
            ): string
        }
    }
}
