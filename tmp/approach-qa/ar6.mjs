import fs from 'fs';
const f='src/data/client-arabic.json';
const a=JSON.parse(fs.readFileSync('src/data/arabic.json','utf8')),c=JSON.parse(fs.readFileSync(f,'utf8'));
const add={
'Other ways to reach us':'طرق أخرى للتواصل معنا',
'Email':'البريد الإلكتروني',
'Phone / WhatsApp':'الهاتف / واتساب',
'Response time':'مدة الرد',
'We reply within one business day':'نردّ خلال يوم عمل واحد',
'Office hours':'ساعات العمل',
'Message us on WhatsApp':'راسلونا عبر واتساب',
};
let s=fs.readFileSync(f,'utf8'),out='',n=0;const had=[];
for(const[k,v]of Object.entries(add)){if(k in a||k in c){had.push(k+' => '+(c[k]??a[k]));continue;}n++;out+=',\n  '+JSON.stringify(k)+': '+JSON.stringify(v);}
const i=s.lastIndexOf('\n}');s=s.slice(0,i)+out+s.slice(i);JSON.parse(s);fs.writeFileSync(f,s);console.log('added',n,'\nexisting:',had);
