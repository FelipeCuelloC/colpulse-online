(function(){
  const $=id=>document.getElementById(id), N=2000;
  let seed=20261013, last=null;
  // Valores de respaldo: se usan solo si data/simulador.json no carga o no es válido (octubre de 2026).
  const RESPALDO={tes_10y:13.3,inflacion_ultima:null,inflacion_promedio:5,inflacion_variabilidad:1.5,dolar_variacion_anual:2.7,dolar_volatilidad:14,colcap_variacion_anual:5.6,colcap_volatilidad:16};
  const ETIQ={
    tes_10y:"Tasa de los bonos del gobierno a 10 años",
    inflacion_ultima:"Cuánto subieron los precios en el último año",
    inflacion_promedio:"Cuánto suben los precios al año, en promedio",
    inflacion_variabilidad:"Qué tanto cambia esa subida de precios (puntos)",
    dolar_variacion_anual:"Cuánto sube el dólar al año, en promedio",
    dolar_volatilidad:"Qué tanto se mueve el dólar al año",
    colcap_variacion_anual:"Cuánto sube la bolsa colombiana al año, en promedio (sin dividendos)",
    colcap_volatilidad:"Qué tanto se mueve la bolsa colombiana al año"};
  const KEYS=Object.keys(ETIQ);
  let SUP={}, DATOS=null, I=[], K=0;
  const fmt=(v,d)=>v.toLocaleString("es-CO",{minimumFractionDigits:d===undefined?0:d,maximumFractionDigits:d===undefined?2:d});
  const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const fecha=s=>{const m=/^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(s||""); if(!m) return "sin fecha"; const mes=MESES[+m[2]-1]; return m[3]?(+m[3])+" de "+mes+" de "+m[1]:mes+" de "+m[1]};
  const mesAnio=s=>{const m=/^(\d{4})-(\d{2})/.exec(s||""); return m?MESES[+m[2]-1]+" de "+m[1]:"sin fecha"};
  function money(v){ const a=Math.abs(v);
    if(a>=1e9) return "$"+(v/1e9).toLocaleString("es-CO",{maximumFractionDigits:2})+" mil millones";
    if(a>=1e6) return "$"+(v/1e6).toLocaleString("es-CO",{maximumFractionDigits:1})+" millones";
    return "$"+Math.round(v).toLocaleString("es-CO"); }
  const short=v=>Math.abs(v)>=1e6?"$"+(v/1e6).toLocaleString("es-CO",{maximumFractionDigits:0})+" M":"$"+Math.round(v).toLocaleString("es-CO");
  const de10=p=>{const n=Math.round(p*10); return n<=0?"casi nunca":n>=10?"casi siempre":n+" de cada 10 veces"};
  const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function num(id,def){const v=parseFloat($(id).value);return isFinite(v)?v:def}
  const net=i=>$("imp").checked?1-Math.min(100,Math.max(0,num("t"+i,0)))/100:1;

  // Supuestos de partida: del JSON del sitio si es válido; si no, valores de respaldo.
  function valido(d){
    if(!d||typeof d!=="object") return false;
    return KEYS.every(k=>{const e=d[k]; return e&&typeof e==="object"&&typeof e.valor==="number"&&isFinite(e.valor)&&typeof e.corte==="string"&&typeof e.fuente==="string"&&e.corte&&e.fuente});
  }
  function fijar(d){
    DATOS=d;
    SUP={tes:d.tes_10y.valor, infl:d.inflacion_promedio.valor, sinf:d.inflacion_variabilidad.valor, dep:d.dolar_variacion_anual.valor, volfx:d.dolar_volatilidad.valor, col:d.colcap_variacion_anual.valor, colvol:d.colcap_volatilidad.valor};
  }
  function respaldo(){
    DATOS=null;
    SUP={tes:RESPALDO.tes_10y, infl:RESPALDO.inflacion_promedio, sinf:RESPALDO.inflacion_variabilidad, dep:RESPALDO.dolar_variacion_anual, volfx:RESPALDO.dolar_volatilidad, col:RESPALDO.colcap_variacion_anual, colvol:RESPALDO.colcap_volatilidad};
  }
  function cargar(){
    return fetch("data/simulador.json",{cache:"no-cache"}).then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
      .then(d=>{ if(!valido(d)) throw new Error("formato"); fijar(d); return true; })
      .catch(()=>{ respaldo(); return false; });
  }

  // k: fix (casi no se mueve), tes, col (acciones Colombia), us, ex
  function armar(){
    I=[
      {n:"CDT en un banco",d:"Le prestas tu plata a un banco por un tiempo fijo y te paga una tasa.",cur:"COP",a:9,b:7,v:1,k:"fix",ix:0.7,tx:4,lq:"Cuando se cumpla el plazo"},
      {n:"Bonos del gobierno colombiano",d:"Le prestas al gobierno (se llaman TES). Pagan bien, pero su precio sube y baja.",cur:"COP",a:SUP.tes,b:8,v:9,k:"tes",tx:4,lq:"En unos días"},
      {n:"Acciones de empresas colombianas",d:"Compras pedacitos de empresas de la bolsa de Colombia.",cur:"COP",a:SUP.col,b:SUP.col,v:SUP.colvol,k:"col",tx:0,lq:"En unos días"},
      {n:"Cuenta en dólares con intereses",d:"Ahorras en dólares y te pagan un interés pequeño.",cur:"USD",a:2,b:2,v:0.5,k:"fix",tx:0,lq:"Cuando quieras"},
      {n:"Bonos del gobierno de EE.UU.",d:"Préstamos cortos al gobierno de EE.UU., en dólares. Muy estables.",cur:"USD",a:3.4,b:3.1,v:1,k:"fix",tx:0,lq:"En unos días"},
      {n:"Acciones de EE.UU.",d:"Un fondo (ETF) que compra las empresas más grandes de EE.UU.",cur:"USD",a:5.3,b:7.5,v:17,k:"us",tx:6,lq:"En unos días"},
      {n:"Acciones del resto del mundo",d:"Un fondo (ETF) con empresas de muchos países, sin EE.UU.",cur:"USD",a:6,b:7.5,v:18,k:"ex",tx:12,lq:"En unos días"}
    ];
    K=I.length;
  }

  function leerTabla(){
    $("sup").innerHTML="<thead><tr><th>Opción</th><th>Primeros 10 años (% al año)</th><th>Después (% al año)</th><th>Qué tanto se mueve (%)</th><th>Impuestos (% de la ganancia)</th><th>En tu mezcla (%)</th></tr></thead><tbody>"+
      I.map((x,i)=>`<tr><td>${esc(x.n)}<small>${x.cur==="USD"?"En dólares":"En pesos"}</small></td>`+
        `<td><input id="a${i}" type="number" step="0.1" value="${x.a}" aria-label="Primeros 10 años, ${esc(x.n)}"></td>`+
        `<td><input id="b${i}" type="number" step="0.1" value="${x.b}" aria-label="Después, ${esc(x.n)}"></td>`+
        `<td><input id="v${i}" type="number" min="0" step="0.5" value="${x.v}" aria-label="Movimiento, ${esc(x.n)}"></td>`+
        `<td><input id="t${i}" type="number" min="0" max="100" step="1" value="${x.tx}" aria-label="Impuestos, ${esc(x.n)}"></td>`+
        `<td><input id="w${i}" type="number" min="0" max="100" step="5" value="0" aria-label="En tu mezcla, ${esc(x.n)}"></td></tr>`).join("")+"</tbody>";
  }
  function read(){
    const w=I.map((_,i)=>Math.max(0,num("w"+i,0))), sw=w.reduce((a,b)=>a+b,0);
    return {monto:Math.max(0,num("monto",0)), aporte:Math.max(0,num("aporte",0)), Y:Math.round(num("anios",10)),
      a:I.map((_,i)=>num("a"+i,0)*net(i)), b:I.map((_,i)=>num("b"+i,0)*net(i)), v:I.map((_,i)=>Math.max(0,num("v"+i,0))/100),
      w:sw>0?w.map(x=>x/sw):I.map(()=>1/K), dep:num("dep",3.5), volfx:Math.max(0,num("volfx",12))/100,
      rhofx:Math.min(0.9,Math.max(-0.9,num("rhofx",-0.3))), infl:num("infl",4.5)/100, sinf:Math.max(0,num("sinf",1.5))/100, duda:Math.max(0,num("duda",2))};
  }
  function simulate(p){
    const R=rng(seed), Y=p.Y, M=Y*12, S=K+1, vals=new Float64Array(S*N*(Y+1));
    let spare=null;
    const norm=()=>{ if(spare!==null){const v=spare;spare=null;return v}
      let u=0; while(u===0)u=R(); const v=R(), m=Math.sqrt(-2*Math.log(u)); spare=m*Math.sin(2*Math.PI*v); return m*Math.cos(2*Math.PI*v) };
    const tail=Math.sqrt(3/5), kfx=Math.sqrt(1-p.rhofx*p.rhofx);
    const dd=new Float64Array(S), val=new Float64Array(S), idx=new Float64Array(S), peak=new Float64Array(S), mdd=new Float64Array(S), r=new Float64Array(S);
    const zc=new Float64Array(K), gg=new Float64Array(S), aa=new Float64Array(S), finG=new Float64Array(S*N), finA=new Float64Array(S*N);
    const valsR=new Float64Array(S*N*(Y+1)), finC=new Float64Array(N), apR=new Float64Array(Y+1);
    for(let i=0;i<N;i++){
      // Cada caso tiene su propia inflación; cuando sube más, el dólar también tiende a subir más.
      const zus=norm(), zex=0.5*zus+Math.sqrt(0.75)*norm(), zcol=0.5*zus+Math.sqrt(0.75)*norm(), ztes=norm(), zfix=norm(), zinf=norm(), zfx=0.6*zinf+0.8*norm();
      const inflP=Math.max(-0.01,p.infl+p.sinf*zinf), mi=Math.pow(1+inflP,1/12), extra=(inflP-p.infl)*100;
      let cum=1, puesto=p.monto; apR[0]+=p.monto;
      for(let j=0;j<K;j++){const k=I[j].k; zc[j]= k==="us"?zus : k==="ex"?zex : k==="col"?zcol : k==="tes"?0.5*ztes : 0.25*zfix}
      for(let s=0;s<S;s++){val[s]=p.monto;idx[s]=1;peak[s]=1;mdd[s]=0;gg[s]=1;aa[s]=0;vals[(s*N+i)*(Y+1)]=p.monto;valsR[(s*N+i)*(Y+1)]=p.monto}
      for(let m=1;m<=M;m++){
        const first=m<=120, sd=first?p.duda:p.duda*0.75;
        cum*=mi; puesto+=p.aporte/cum;
        let c=0; for(let q=0;q<5;q++){const n=norm(); c+=n*n}
        const f=tail/Math.sqrt(c/5), n1=norm(), eus=n1*f, eex=(0.8*n1+0.6*norm())*f, ecol=(0.5*n1+Math.sqrt(0.75)*norm())*f,
              etes=norm()*f, efix=norm()*f, efx=(p.rhofx*n1+kfx*norm())*f;
        const fx=(p.dep+0.75*sd*zfx)/1200+p.volfx/Math.sqrt(12)*efx;
        let mix=0;
        for(let j=0;j<K;j++){
          const k=I[j].k, e= k==="us"?eus : k==="ex"?eex : k==="col"?ecol : k==="tes"?etes : efix;
          let lr=((first?p.a[j]:p.b[j])+sd*zc[j]+(I[j].ix||0)*extra)/1200+p.v[j]/Math.sqrt(12)*e;
          if(I[j].cur==="USD") lr+=fx;
          r[j]=Math.exp(lr)-1; mix+=p.w[j]*r[j];
        }
        r[K]=mix;
        for(let s=0;s<S;s++){
          val[s]=val[s]*(1+r[s])+p.aporte; idx[s]*=(1+r[s]); gg[s]*=(1+r[s]); aa[s]=aa[s]*(1+r[s])+1;
          if(idx[s]>peak[s])peak[s]=idx[s]; const d=1-idx[s]/peak[s]; if(d>mdd[s])mdd[s]=d;
          if(m%12===0){ vals[(s*N+i)*(Y+1)+m/12]=val[s]; valsR[(s*N+i)*(Y+1)+m/12]=val[s]/cum; if(s===0) apR[m/12]+=puesto; }
        }
      }
      for(let s=0;s<S;s++){ if(mdd[s]>=0.30)dd[s]++; finG[s*N+i]=gg[s]; finA[s*N+i]=aa[s]; }
      finC[i]=cum;
    }
    const q=[0.05,0.25,0.5,0.75,0.95], col=new Float64Array(N), out=[];
    for(let s=0;s<S;s++){
      const mk=src=>{ const bands=q.map(()=>new Float64Array(Y+1));
        for(let y=0;y<=Y;y++){ for(let i=0;i<N;i++)col[i]=src[(s*N+i)*(Y+1)+y]; col.sort(); q.forEach((qq,b)=>{bands[b][y]=col[Math.min(N-1,Math.floor(qq*N))]}); }
        return bands; };
      out.push({k:s, name:s<K?I[s].n:"Tu mezcla", nom:mk(vals), real:mk(valsR), dd:dd[s]/N});
    }
    const ap=new Float64Array(Y+1); for(let y=0;y<=Y;y++){ ap[y]=p.monto+p.aporte*12*y; apR[y]/=N; }
    return {rows:out, ap, apR, valsR, finC, Y, finG, finA, monto:p.monto, aporte:p.aporte, infl:p.infl};
  }
  // Plata de hoy: descuenta la subida de precios de cada año.
  function vista(){
    const real=$("real").checked, Y=last.Y, ap=real?last.apR:last.ap;
    const rows=last.rows.map(x=>{ const b=real?x.real:x.nom; return {k:x.k,name:x.name,dd:x.dd,bands:b,p5:b[0][Y],med:b[2][Y],p95:b[4][Y]}; });
    return {rows,ap,aportado:ap[Y],Y};
  }
  // Meta: el valor final es monto*G + aporte*A en cada caso, así que el ahorro necesario sale sin volver a simular.
  function metaDe(k){
    const T0=Math.max(0,num("meta",0)), real=$("real").checked, req=new Float64Array(N); let ok=0;
    for(let i=0;i<N;i++){ const T=real?T0*last.finC[i]:T0, a=(T-last.monto*last.finG[k*N+i])/last.finA[k*N+i]; req[i]=a>0?a:0; if(a<=last.aporte)ok++; }
    req.sort(); return {prob:ok/N, q80:req[Math.floor(0.8*N)], meta:T0};
  }
  const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
  // Promedio y variación del resultado final de cada opción, en plata de hoy, medidos sobre los casos simulados.
  function modelo(){
    const Y=last.Y, base=last.apR[Y]||1, mu=[], X=[];
    for(let j=0;j<K;j++){ const x=new Float64Array(N); let m=0;
      for(let i=0;i<N;i++){ x[i]=last.valsR[(j*N+i)*(Y+1)+Y]/base; m+=x[i]; }
      m/=N; for(let i=0;i<N;i++)x[i]-=m; mu.push(m); X.push(x); }
    return {mu, S:X.map(a=>X.map(b=>{ let s=0; for(let i=0;i<N;i++)s+=a[i]*b[i]; return s/N; }))};
  }
  function proj(v,cap){ let lo=Math.min(...v)-1, hi=Math.max(...v);
    for(let i=0;i<60;i++){ const t=(lo+hi)/2, s=v.reduce((a,x)=>a+Math.min(cap,Math.max(0,x-t)),0); if(s>1)lo=t; else hi=t; }
    return v.map(x=>Math.min(cap,Math.max(0,x-hi))); }
  function frontera(){
    const m=modelo(), cap=Math.max(num("tope",50)/100,1/K+0.01), tr=m.S.reduce((s,r,i)=>s+r[i],0), out=[];
    for(let g=0;g<=40;g++){ const lam=g===40?0:400*Math.pow(0.82,g), step=1/(2*lam*tr+1); let w=new Array(K).fill(1/K);
      for(let it=0;it<500;it++){ const Sw=m.S.map(r=>dot(r,w)); w=proj(w.map((x,i)=>x+step*(m.mu[i]-2*lam*Sw[i])),cap); }
      const s=w.reduce((a,x)=>a+x,0); w=w.map(x=>x/s); out.push({w, r:dot(m.mu,w)}); }
    return out.sort((a,b)=>a.r-b.r);
  }
  const NIVEL=[["Muy tranquilo","El resultado cambia poco entre un caso bueno y uno malo, pero crece menos."],["Tranquilo","Crece un poco más, con resultados todavía parecidos entre sí."],["Equilibrado","Busca crecer más y acepta que el resultado puede variar."],["Arriesgado","Puede crecer bastante más, y también quedar bastante por debajo."],["Muy arriesgado","La diferencia entre un caso bueno y uno malo es grande."]];
  function mezclar(){
    last=simulate(read()); const fr=frontera(), t=num("riesgo",50)/100, pick=fr[Math.round(t*(fr.length-1))];
    const w=pick.w.map(x=>Math.round(x*100)); w[w.indexOf(Math.max(...w))]+=100-w.reduce((a,b)=>a+b,0);
    w.forEach((x,i)=>{$("w"+i).value=x});
    const nv=NIVEL[Math.min(4,Math.floor(t*5))];
    $("nivel").textContent=nv[0]+". "+nv[1];
    $("mixout").innerHTML=w.map((x,i)=>x>0?`<div class="it"><span>${esc(I[i].n)}<small class="muted" style="display:block">${esc(I[i].d)}</small></span><b>${x}%</b><div class="bar"><i style="width:${x}%"></i></div></div>`:"").join("");
    run();
  }
  function tk(lo,hi){const raw=(hi-lo)/5, mag=Math.pow(10,Math.floor(Math.log10(raw))), n=raw/mag, step=(n<1.5?1:n<3?2:n<7?5:10)*mag, t=[]; for(let v=Math.ceil(lo/step)*step; v<=hi*1.001; v+=step)t.push(v); return t}
  function render(){
    const res=vista(), Y=res.Y, real=$("real").checked, mia=res.rows[K], g=metaDe(K);
    $("sub3").textContent=`En ${Y} años habrías puesto ${money(res.aportado)} de tu bolsillo${real?", en plata de hoy":""}. Con tu mezcla, esto es lo que podrías tener:`;
    $("tres").innerHTML=
      `<div class="caso"><span>Si sale mal</span><b>${money(mia.p5)}</b><span>Solo 1 de cada 20 veces sale peor que esto.</span></div>`+
      `<div class="caso normal"><span>Lo normal</span><b>${money(mia.med)}</b><span>La mitad de las veces sale mejor y la otra mitad peor.</span></div>`+
      `<div class="caso"><span>Si sale bien</span><b>${money(mia.p95)}</b><span>Solo 1 de cada 20 veces sale mejor que esto.</span></div>`;
    const baja= mia.dd<0.05?"Casi nunca":mia.dd<0.3?"A veces":"Con frecuencia";
    const falta = g.q80>last.aporte ? `Para llegar casi siempre (8 de cada 10 veces) tendrías que ahorrar <strong>${money(g.q80)} al mes</strong>, en vez de ${money(last.aporte)}.` : `Con lo que ahorras hoy ya llegas 8 de cada 10 veces o más.`;
    $("frases").innerHTML=
      `<li>Llegas a tu meta de ${money(g.meta)} <strong>${de10(g.prob)}</strong>.</li>`+
      `<li>${falta}</li>`+
      `<li><strong>${baja}</strong> tu plata pierde casi un tercio de su valor en algún momento del camino. Si eso pasa, lo peor es sacarla en ese momento.</li>`;
    // gráfico
    const b=mia.bands, W=Math.max(300,Math.min(820,$("chart").clientWidth||760)), H=W<480?280:340, L=58,Rm=14,T=12,B=32, hi=Math.max(b[4][Y],res.ap[Y],g.meta)*1.05, X=y=>L+(W-L-Rm)*y/Y, yy=v=>T+(H-T-B)*(1-v/hi);
    const line=a=>Array.from(a).map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+yy(v).toFixed(1)).join("");
    const area=(u,d)=>line(u)+Array.from(d).map((v,i)=>[X(i),yy(v)]).reverse().map(p=>"L"+p[0].toFixed(1)+" "+p[1].toFixed(1)).join("")+"Z";
    let s=""; tk(0,hi).forEach(t=>{const py=yy(t).toFixed(1); s+=`<line x1="${L}" x2="${W-Rm}" y1="${py}" y2="${py}" stroke="var(--border)" stroke-width="1"/><text x="${L-8}" y="${(+py+4).toFixed(1)}" text-anchor="end">${short(t)}</text>`});
    const st=Math.max(1,Math.ceil(Y/(W<480?5:10))); for(let y=0;y<=Y;y+=st) s+=`<text x="${X(y).toFixed(1)}" y="${H-10}" text-anchor="middle">${y===0?"hoy":"año "+y}</text>`;
    s+=`<path d="${area(b[4],b[0])}" fill="var(--sim-band-wide)"/><path d="${area(b[3],b[1])}" fill="var(--sim-band-mid)"/>`+
       `<path d="${line(res.ap)}" fill="none" stroke="var(--sim-ref)" stroke-width="1.6" stroke-dasharray="5 4"/>`+
       (g.meta>0?`<line x1="${L}" x2="${W-Rm}" y1="${yy(g.meta).toFixed(1)}" y2="${yy(g.meta).toFixed(1)}" stroke="var(--sim-good)" stroke-width="1.8"/>`:"")+
       `<g class="chart-series"><path d="${line(b[2])}" fill="none" stroke="var(--sim-line)" stroke-width="2.4"/><circle cx="${X(Y)}" cy="${yy(b[2][Y]).toFixed(1)}" r="4" fill="var(--sim-line)"/></g>`;
    $("chart").innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cómo podría crecer tu ahorro año a año">${s}</svg>`;
    // comparación
    const rows=res.rows.map(x=>Object.assign({},x,{g:metaDe(x.k)})), o=$("orden").value;
    rows.sort(o==="p5"?(a,c)=>c.p5-a.p5 : o==="meta"?(a,c)=>c.g.prob-a.g.prob||c.med-a.med : (a,c)=>c.med-a.med);
    $("tabla").innerHTML=rows.map(x=>`<div class="op${x.k===K?' mia':''}"><div><strong>${esc(x.name)}</strong><small>${x.k<K?esc(I[x.k].d):"La que armaste en el paso 2."}</small></div><dl>`+
      `<div><dt>Lo normal</dt><dd class="num">${money(x.med)}</dd></div><div><dt>Si sale mal</dt><dd class="num">${money(x.p5)}</dd></div>`+
      `<div><dt>¿Llegas a tu meta?</dt><dd>${de10(x.g.prob)}</dd></div><div><dt>¿Puede bajar fuerte?</dt><dd>${x.dd<0.05?"Casi nunca":x.dd<0.3?"A veces":"Con frecuencia"}</dd></div>`+
      `<div><dt>¿Cuándo sacas la plata?</dt><dd>${x.k<K?I[x.k].lq:"Depende de cada parte"}</dd></div></dl></div>`).join("");
  }
  function textos(){ $("montot").textContent=money(num("monto",0)); $("aportet").textContent=money(num("aporte",0))+" al mes"; $("metat").textContent=money(num("meta",0)); $("aniosv").textContent=$("anios").value; }
  function run(){ textos(); last=simulate(read()); render(); }
  function ofertas(){ let best=null;
    for(let i=0;i<3;i++){ const t=parseFloat($("ot"+i).value); if(isFinite(t)&&t>0&&(!best||t>best.t)) best={n:$("on"+i).value.trim()||("Oferta "+(i+1)),t}; }
    $("ofout").textContent = best ? `La tasa más alta de las que escribiste es la de ${best.n}: ${best.t.toLocaleString("es-CO")}% al año. Antes de decidir, mira también el plazo, el monto mínimo y que la entidad tenga seguro de depósitos.` : "Escribe las tasas que te ofrezcan.";
    return best; }

  function estado(n,mod,label,text){ n.className="ui-state"+(mod?" "+mod:""); n.textContent=""; const l=document.createElement("span"); l.className="ui-state__label"; l.textContent=label; n.appendChild(l); n.appendChild(document.createTextNode(text)); }
  // Trazo opcional del caso normal: solo al pulsar, 650 ms, sin bucle (el CSS lo apaga con movimiento reducido).
  function trazar(){ const g=document.querySelector("#chart .chart-series"); if(!g) return; g.classList.remove("is-replaying"); void g.getBoundingClientRect(); g.classList.add("is-replaying"); setTimeout(()=>g.classList.remove("is-replaying"),700); }
  // De dónde salen los números: tabla de datos (con fecha y fuente) y lista de supuestos del autor.
  function fuentes(ok){
    const est=$("fuente-estado");
    if(ok){
      estado(est,"","Datos cargados","Los números de partida vienen de datos de ColPulse (data/simulador.json). Puedes cambiarlos en «Para curiosos».");
      $("fuentes").innerHTML="<thead><tr><th>Qué es</th><th>Valor</th><th>Corte</th><th>Fuente</th></tr></thead><tbody>"+KEYS.map(k=>{
        const e=DATOS[k], v=fmt(e.valor,2)+(e.unidad&&e.unidad.indexOf("%")===0?"%":" puntos"), vent=e.ventana?`<small>Datos de ${mesAnio(e.ventana.desde+"-01")} a ${mesAnio(e.ventana.hasta+"-01")}.</small>`:"", nota=e.nota?`<small>${esc(e.nota)}</small>`:"";
        return `<tr><td>${esc(ETIQ[k])}${vent}${nota}</td><td class="num">${v}</td><td>${fecha(e.corte)}</td><td>${esc(e.fuente)}</td></tr>`;
      }).join("")+"</tbody>";
    } else {
      estado(est,"ui-state--stale","Datos de respaldo","No pudimos cargar los datos actualizados (data/simulador.json). Estamos usando valores de respaldo de octubre de 2026, que pueden estar desactualizados.");
      $("fuentes").innerHTML="<thead><tr><th>Qué es</th><th>Valor de respaldo</th><th>Fuente</th></tr></thead><tbody>"+KEYS.filter(k=>RESPALDO[k]!==null).map(k=>
        `<tr><td>${esc(ETIQ[k])}</td><td class="num">${fmt(RESPALDO[k],2)}${k==="inflacion_variabilidad"?" puntos":"%"}</td><td>Respaldo de octubre de 2026 (Banco de la República y DANE, cálculos de ColPulse)</td></tr>`).join("")+"</tbody>";
    }
    const corte=$("sim-corte");
    if(corte){ const cs=ok?KEYS.map(k=>DATOS[k].corte).sort():[]; corte.textContent=ok?"Corte de los datos: "+fecha(cs[0])+(cs[0]!==cs[cs.length-1]?" a "+fecha(cs[cs.length-1]):""):"Respaldo de octubre de 2026"; if(ok) corte.setAttribute("datetime",cs[cs.length-1]); }
    const ult=ok?`La última lectura fue ${fmt(DATOS.inflacion_ultima.valor,2)}% (${mesAnio(DATOS.inflacion_ultima.corte)}).`:"";
    $("inflt").textContent=ult;
    // Supuestos del autor: lo que no sale de datos.
    const au=I.map(x=>{
      const partes=[];
      if(x.k==="tes") partes.push("lo que rinde después de 10 años: "+fmt(x.b,1)+"%","qué tanto se mueve su precio: "+fmt(x.v,1)+"%");
      else if(x.k==="col") partes.push("impuesto: "+x.tx+"% de la ganancia");
      else partes.push("rendimiento: "+fmt(x.a,1)+"% los primeros 10 años y "+fmt(x.b,1)+"% después","qué tanto se mueve: "+fmt(x.v,1)+"%","impuesto: "+x.tx+"% de la ganancia");
      return `<tr><td>${esc(x.n)}</td><td>${esc(partes.join("; "))}</td></tr>`; }).join("");
    $("autor").innerHTML="<thead><tr><th>Opción</th><th>Supuesto del autor (no sale de datos)</th></tr></thead><tbody>"+au+"</tbody>";
    // Notas de «Ten en cuenta», con las mismas cifras.
    const hv=ok?DATOS.colcap_variacion_anual.ventana:null, ds=ok?(+hv.desde.slice(0,4)):2008, hs=ok?(+hv.hasta.slice(0,4)):2026;
    $("nota-tasas").innerHTML="Las tasas en Colombia están altas hoy. Para el CDT suponemos "+fmt(I[0].a,1)+"% al año en la primera década, porque esperamos que bajen (es un supuesto del autor). Los bonos del gobierno parten de "+(ok?"la tasa cero cupón a 10 años de "+fecha(DATOS.tes_10y.corte)+" ("+fmt(SUP.tes,2)+"%, Banco de la República)":"un valor de respaldo de octubre de 2026 ("+fmt(SUP.tes,2)+"%)")+".";
    $("nota-hist").textContent="Para las acciones colombianas, el dólar y los precios usamos lo que pasó entre "+ds+" y "+hs+(ok?"":" (valores de respaldo)")+": la bolsa subió "+fmt(SUP.col,1)+"% al año sin contar dividendos, el dólar "+fmt(SUP.dep,1)+"% y los precios "+fmt(SUP.infl,1)+"% al año en promedio (Banco de la República y DANE, cálculos de ColPulse).";
  }

  function iniciar(ok){
    armar(); leerTabla();
    $("infl").value=SUP.infl; $("sinf").value=SUP.sinf; $("dep").value=SUP.dep; $("volfx").value=SUP.volfx;
    fuentes(ok);
    ["monto","aporte","anios","tope","infl","sinf","dep","volfx","rhofx","duda","imp"].forEach(id=>$(id).addEventListener("change",mezclar));
    ["monto","aporte","meta","anios"].forEach(id=>$(id).addEventListener("input",textos));
    $("riesgo").addEventListener("change",mezclar);
    $("sup").addEventListener("change",e=>{ if(e.target.id && e.target.id[0]==="w") run(); else mezclar(); });
    ["meta","real","orden"].forEach(id=>$(id).addEventListener("change",()=>{textos(); if(last)render()}));
    if($("trazar")) $("trazar").addEventListener("click",trazar);
    $("otra").addEventListener("click",()=>{seed=(seed*1664525+1013904223)|0;run()});
    [0,1,2].forEach(i=>{$("ot"+i).addEventListener("input",ofertas); $("on"+i).addEventListener("input",ofertas)});
    $("usar").addEventListener("click",()=>{ const b=ofertas(); if(b){ $("a0").value=b.t; mezclar(); } });
    let rt=null; addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(()=>{ if(last) render(); },200); });
    mezclar();
  }
  cargar().then(iniciar);
})();
