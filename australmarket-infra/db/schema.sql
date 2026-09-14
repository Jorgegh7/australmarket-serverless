create table artesanos (
   id              uuid primary key default gen_random_uuid(),
   nombre          text not null,
   historia        text,
   region          text,
   foto_perfil_url text,
   telefono        text not null,
   red_social      text,
   mail            text
);

create table productos (
   id          uuid primary key default gen_random_uuid(),
   artesano_id uuid not null
      references artesanos ( id ),
   nombre      text not null,
   historia    text,
   imagen_url  text,
   precio      numeric,
   categoria   text
);