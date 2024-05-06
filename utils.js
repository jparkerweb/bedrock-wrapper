// **********************
// ** HELPER FUNCTIONS **
// **********************


// ----------------------------------------------------
// -- get a value from an object using a path string --
// ----------------------------------------------------
export function getValueByPath(obj, path) {
    // Split the path into an array of keys
    let keys = path.replace(/\[(\w+)\]/g, '.$1').split('.');  // Convert indexes into properties
    // Reduce the keys array to the final value
    return keys.reduce((acc, key) => acc && acc[key], obj);
}


// --------------------------
// -- write ascii art logo --
// --------------------------
export async function writeAsciiArt() {
    console.log(`
     ___         _                 _     _ _ _                               
    | . > ___  _| | _ _  ___  ___ | |__ | | | | _ _  ___  ___  ___  ___  _ _ 
    | . \\/ ._>/ . || '_>/ . \\/ | '| / / | | | || '_><_> || . \\| . \\/ ._>| '_>
    |___/\\___.\\___||_|  \\___/\\_|_.|_\\_\\ |__/_/ |_|  <___||  _/|  _/\\___.|_|  
                                                         |_|  |_|            
    `);
}