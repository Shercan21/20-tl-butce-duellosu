// A self-contained animated island short: works offline without third-party video.
export function createCinemaFilm(image){
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=384;
 const c=canvas.getContext('2d');let last=-1;
 function draw(time=0){const frame=Math.floor(time*12);if(frame===last)return false;last=frame;
  const t=time%24,zoom=1.07+.025*Math.sin(t*.25),iw=image.width,ih=image.height;
  const sw=iw/zoom,sh=Math.min(ih,sw/2),sx=(iw-sw)*(.5+.45*Math.sin(t*.17)),sy=(ih-sh)*.48;
  c.drawImage(image,sx,sy,sw,sh,0,0,768,384);
  // Sunlit moving ripples and a tiny sailing boat in the foreground.
  c.save();c.globalAlpha=.25;c.strokeStyle='#eaffff';c.lineWidth=1.4;
  for(let row=0;row<5;row++)for(let k=0;k<8;k++){const x=(k*110+time*(8+row*2))%850-50,y=333+row*9+Math.sin(k+time)*2;c.beginPath();c.ellipse(x,y,13+row*2,1.2,0,0,Math.PI);c.stroke();}c.restore();
  const bx=70+(time*10)%620,by=341+Math.sin(time*1.4)*2;c.save();c.translate(bx,by);c.fillStyle='#573e2e';c.beginPath();c.moveTo(-21,0);c.lineTo(21,0);c.lineTo(12,8);c.lineTo(-14,8);c.fill();c.fillStyle='#fff7d9';c.beginPath();c.moveTo(0,-39);c.lineTo(0,-3);c.lineTo(23,-3);c.fill();c.strokeStyle='#6b4d30';c.beginPath();c.moveTo(0,0);c.lineTo(0,-41);c.stroke();c.restore();
  c.strokeStyle='#344852';c.lineWidth=2;for(let i=0;i<3;i++){const x=(time*27+i*65)%880-60,y=43+i*16+Math.sin(time+i)*5,wing=5+Math.sin(time*5+i)*3;c.beginPath();c.moveTo(x-9,y+wing);c.quadraticCurveTo(x-4,y-4,x,y);c.quadraticCurveTo(x+4,y-4,x+9,y+wing);c.stroke();}
  const shade=c.createLinearGradient(0,0,0,384);shade.addColorStop(0,'#001a2518');shade.addColorStop(.8,'#001a2500');shade.addColorStop(1,'#001a2540');c.fillStyle=shade;c.fillRect(0,0,768,384);return true;
 }
 draw(0);return {canvas,draw};
}
