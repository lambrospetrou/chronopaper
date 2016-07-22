export class Utils {
    
    // https://john-dugan.com/javascript-debounce/
    debounce(func, wait, immediate) {
        let timeout;
        if (immediate === true) {
            return function() {
                func.apply(this, arguments);
            };
        }
        return function() {
            console.log('i');
            const context = this;
            const args = arguments;

            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait || 200);
        };
    }

};