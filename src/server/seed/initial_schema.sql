
CREATE TABLE "Assignments" (
    periods integer[] NOT NULL,
    offering_id integer NOT NULL,
    registration_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Assignments" OWNER TO mbu;


CREATE TABLE "Badges" (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    notes character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Badges" OWNER TO mbu;


CREATE SEQUENCE "Badges_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Badges_id_seq" OWNER TO mbu;


ALTER SEQUENCE "Badges_id_seq" OWNED BY "Badges".id;



CREATE TABLE "Events" (
    id integer NOT NULL,
    year integer NOT NULL,
    semester character varying(255) NOT NULL,
    date timestamp with time zone NOT NULL,
    registration_open timestamp with time zone NOT NULL,
    registration_close timestamp with time zone NOT NULL,
    price numeric(5,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Events" OWNER TO mbu;


CREATE SEQUENCE "Events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Events_id_seq" OWNER TO mbu;


ALTER SEQUENCE "Events_id_seq" OWNED BY "Events".id;



CREATE TABLE "Offerings" (
    id integer NOT NULL,
    duration integer NOT NULL,
    periods integer[] NOT NULL,
    price numeric(5,2) DEFAULT 0 NOT NULL,
    event_id integer NOT NULL,
    badge_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Offerings" OWNER TO mbu;


CREATE SEQUENCE "Offerings_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Offerings_id_seq" OWNER TO mbu;


ALTER SEQUENCE "Offerings_id_seq" OWNED BY "Offerings".id;



CREATE TABLE "Preferences" (
    rank integer NOT NULL,
    offering_id integer NOT NULL,
    registration_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Preferences" OWNER TO mbu;


CREATE TABLE "Purchasables" (
    id integer NOT NULL,
    item character varying(255) NOT NULL,
    description character varying(255),
    price numeric(5,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    event_id integer
);


ALTER TABLE "Purchasables" OWNER TO mbu;


CREATE SEQUENCE "Purchasables_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Purchasables_id_seq" OWNER TO mbu;


ALTER SEQUENCE "Purchasables_id_seq" OWNED BY "Purchasables".id;



CREATE TABLE "Purchases" (
    purchasable_id integer NOT NULL,
    registration_id integer NOT NULL,
    size character varying(255),
    quantity integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Purchases" OWNER TO mbu;


CREATE TABLE "Registrations" (
    id integer NOT NULL,
    event_id integer NOT NULL,
    scout_id integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Registrations" OWNER TO mbu;


CREATE SEQUENCE "Registrations_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Registrations_id_seq" OWNER TO mbu;


ALTER SEQUENCE "Registrations_id_seq" OWNED BY "Registrations".id;



CREATE TABLE "Scouts" (
    id integer NOT NULL,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    birthday timestamp with time zone NOT NULL,
    troop integer NOT NULL,
    notes character varying(255),
    emergency_name character varying(255) NOT NULL,
    emergency_relation character varying(255) NOT NULL,
    emergency_phone character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    user_id integer
);


ALTER TABLE "Scouts" OWNER TO mbu;


CREATE SEQUENCE "Scouts_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Scouts_id_seq" OWNER TO mbu;


ALTER SEQUENCE "Scouts_id_seq" OWNED BY "Scouts".id;


CREATE TABLE "Users" (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    reset_password_token character varying(255),
    reset_token_expires timestamp with time zone,
    firstname character varying(255) NOT NULL,
    lastname character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'anonymous'::character varying NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE "Users" OWNER TO mbu;


CREATE SEQUENCE "Users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Users_id_seq" OWNER TO mbu;


ALTER SEQUENCE "Users_id_seq" OWNED BY "Users".id;



ALTER TABLE ONLY "Badges" ALTER COLUMN id SET DEFAULT nextval('"Badges_id_seq"'::regclass);



ALTER TABLE ONLY "Events" ALTER COLUMN id SET DEFAULT nextval('"Events_id_seq"'::regclass);



ALTER TABLE ONLY "Offerings" ALTER COLUMN id SET DEFAULT nextval('"Offerings_id_seq"'::regclass);



ALTER TABLE ONLY "Purchasables" ALTER COLUMN id SET DEFAULT nextval('"Purchasables_id_seq"'::regclass);



ALTER TABLE ONLY "Registrations" ALTER COLUMN id SET DEFAULT nextval('"Registrations_id_seq"'::regclass);



ALTER TABLE ONLY "Scouts" ALTER COLUMN id SET DEFAULT nextval('"Scouts_id_seq"'::regclass);



ALTER TABLE ONLY "Users" ALTER COLUMN id SET DEFAULT nextval('"Users_id_seq"'::regclass);



ALTER TABLE ONLY "Assignments"
    ADD CONSTRAINT "Assignments_pkey" PRIMARY KEY (offering_id, registration_id);



ALTER TABLE ONLY "Badges"
    ADD CONSTRAINT "Badges_name_key" UNIQUE (name);



ALTER TABLE ONLY "Badges"
    ADD CONSTRAINT "Badges_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY "Events"
    ADD CONSTRAINT "Events_date_key" UNIQUE (date);



ALTER TABLE ONLY "Events"
    ADD CONSTRAINT "Events_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY "Offerings"
    ADD CONSTRAINT "Offerings_event_id_badge_id_key" UNIQUE (event_id, badge_id);



ALTER TABLE ONLY "Offerings"
    ADD CONSTRAINT "Offerings_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY "Preferences"
    ADD CONSTRAINT "Preferences_pkey" PRIMARY KEY (offering_id, registration_id);



ALTER TABLE ONLY "Purchasables"
    ADD CONSTRAINT "Purchasables_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY "Registrations"
    ADD CONSTRAINT "Registrations_event_id_scout_id_key" UNIQUE (event_id, scout_id);



ALTER TABLE ONLY "Registrations"
    ADD CONSTRAINT "Registrations_pkey" PRIMARY KEY (id);



ALTER TABLE ONLY "Scouts"
    ADD CONSTRAINT "Scouts_pkey" PRIMARY KEY (id);


ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);



ALTER TABLE ONLY "Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);



CREATE UNIQUE INDEX badges_ ON "Badges" USING btree (lower((name)::text));



CREATE UNIQUE INDEX users_ ON "Users" USING btree (lower((email)::text));



ALTER TABLE ONLY "Assignments"
    ADD CONSTRAINT "Assignments_offering_id_fkey" FOREIGN KEY (offering_id) REFERENCES "Offerings"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Assignments"
    ADD CONSTRAINT "Assignments_registration_id_fkey" FOREIGN KEY (registration_id) REFERENCES "Registrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Offerings"
    ADD CONSTRAINT "Offerings_badge_id_fkey" FOREIGN KEY (badge_id) REFERENCES "Badges"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Offerings"
    ADD CONSTRAINT "Offerings_event_id_fkey" FOREIGN KEY (event_id) REFERENCES "Events"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Preferences"
    ADD CONSTRAINT "Preferences_offering_id_fkey" FOREIGN KEY (offering_id) REFERENCES "Offerings"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Preferences"
    ADD CONSTRAINT "Preferences_registration_id_fkey" FOREIGN KEY (registration_id) REFERENCES "Registrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Purchasables"
    ADD CONSTRAINT "Purchasables_event_id_fkey" FOREIGN KEY (event_id) REFERENCES "Events"(id) ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "Purchases"
    ADD CONSTRAINT "Purchases_purchasable_id_fkey" FOREIGN KEY (purchasable_id) REFERENCES "Purchasables"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Purchases"
    ADD CONSTRAINT "Purchases_registration_id_fkey" FOREIGN KEY (registration_id) REFERENCES "Registrations"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Registrations"
    ADD CONSTRAINT "Registrations_event_id_fkey" FOREIGN KEY (event_id) REFERENCES "Events"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Registrations"
    ADD CONSTRAINT "Registrations_scout_id_fkey" FOREIGN KEY (scout_id) REFERENCES "Scouts"(id) ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "Scouts"
    ADD CONSTRAINT "Scouts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "Users"(id) ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "Purchases"
    ADD CONSTRAINT "Purchases_pkey" FOREIGN KEY (purchasable_id) REFERENCES "Purchasables"(id) ON UPDATE CASCADE ON DELETE SET NULL;
