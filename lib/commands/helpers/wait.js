const format=require('./formatters');module.exports=a=>new Promise((b,c)=>{let d,e,f=a.id,g=Date.now(),h=()=>{clearInterval(d),clearInterval(e),{}!==a.error&&pgb.opts.exitcode?c(new Error):a.package?b(a):b(pgb.api.getApp(f))},i=a=>{a=Math.round(a/1e3);let b=Math.floor(a/60),c=a-60*b;return 10>c&&(c='0'+c),` ${b}:${c}`},j=b=>{if(!pgb.opts.noprogress){b||process.stderr.write('\x1B[7A');let c=i(Date.now()-g);a.completed&&' 0:00'===c&&(c=''),process.stderr.write(`${'-'.repeat(25)}
${pgb.colours.header(' App Id')}: ${pgb.colours.bold(f)}
${'-'.repeat(25)}
${pgb.colours.header('Android')}: ${format.status(a.status.android)}           
${pgb.colours.header('    iOS')}: ${format.status(a.status.ios)}           
${pgb.colours.header('Windows')}: ${format.status(a.status.winphone)}           
${'-'.repeat(25-c.length)}${pgb.colours.bold(c)}\n`)}a.completed&&h()};return pgb.opts.exit?h():(j(!0),a.completed?h():void(d=setInterval(()=>{pgb.api.getStatus(f).then(b=>{a=b}).catch(c)},2e3),e=setInterval(j,1e3)))});