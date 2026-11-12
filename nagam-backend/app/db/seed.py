import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.core.security import get_password_hash
from app.modules.organizations.models import Organization, OrganizationSetting
from app.modules.cities.models import City
from app.modules.wards.models import Ward, Locality
from app.modules.departments.models import Department
from app.modules.users.models import User, CitizenProfile, StaffProfile, Role, UserRole
from app.modules.complaints.models import Complaint, ComplaintStatusHistory, ComplaintComment
from app.modules.applications.models import ServiceDefinition, ServiceApplication, ApplicationStatusHistory
from app.modules.notices.models import Notice
from app.common.permissions import RoleEnum, ComplaintStatus, ApplicationStatus, NoticeStatus

async def seed_data():
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        res = await session.execute(select(Organization).limit(1))
        if res.scalar_one_or_none():
            print("Database already seeded. Skipping.")
            return

        print("Seeding NagarConnect test data...")

        # 1. Seed Roles
        roles_data = [
            (RoleEnum.PLATFORM_SUPER_ADMIN, "Platform Super Admin", "Global cross-tenant platform administration"),
            (RoleEnum.MUNICIPAL_SUPER_ADMIN, "Municipal Super Admin", "Corporation-wide administration and governance"),
            (RoleEnum.DEPARTMENT_ADMIN, "Department Admin", "Manages departmental officers, grievances, and services"),
            (RoleEnum.DEPARTMENT_OFFICER, "Department Officer", "Field updates, resolution, and complaint processing"),
            (RoleEnum.WARD_OFFICER, "Ward Officer", "Ward-level oversight and on-ground verification"),
            (RoleEnum.COMPLAINT_STAFF, "Complaint Staff", "Helpdesk triage and helpline grievance intake"),
            (RoleEnum.APPLICATION_REVIEWER, "Application Reviewer", "Civic service application review and decisions"),
            (RoleEnum.READ_ONLY_AUDITOR, "Read Only Auditor", "Auditing and compliance oversight"),
            (RoleEnum.CITIZEN, "Citizen", "Public citizen account"),
        ]
        roles_map = {}
        for code, name, desc in roles_data:
            role = Role(code=code, name=name, description=desc)
            session.add(role)
            roles_map[code] = role

        await session.flush()

        # 2. Seed Organizations
        org_lmc = Organization(
            code="LMC-UP",
            name="Lucknow Municipal Corporation",
            state="Uttar Pradesh",
            branding={
                "tagline": "Pride of Awadh, Clean & Smart Capital",
                "primary_color": "#142F58",
                "secondary_color": "#245A86",
                "portal_title": "Lucknow Municipal Corporation Citizen Services"
            },
            config={
                "supported_languages": ["en", "hi"],
                "enabled_modules": ["complaints", "applications", "notices", "tenders", "water_supply"],
                "helpline_toll_free": "1800-180-1533"
            }
        )
        org_vnn = Organization(
            code="VNN-UP",
            name="Varanasi Nagar Nigam",
            state="Uttar Pradesh",
            branding={
                "tagline": "Preserving Heritage, Embracing Smart Governance",
                "primary_color": "#1B3A4B",
                "secondary_color": "#006466",
                "portal_title": "Varanasi Nagar Nigam Civic Portal"
            },
            config={
                "supported_languages": ["en", "hi"],
                "enabled_modules": ["complaints", "applications", "notices", "sanitation_schedule"],
                "helpline_toll_free": "1800-180-2345"
            }
        )
        org_ann = Organization(
            code="ANN-UP",
            name="Agra Nagar Nigam",
            state="Uttar Pradesh",
            branding={
                "tagline": "Clean City, Green City, World Wonder Heritage",
                "primary_color": "#22333B",
                "secondary_color": "#5E503F",
                "portal_title": "Agra Nagar Nigam Citizen Portal"
            },
            config={
                "supported_languages": ["en", "hi"],
                "enabled_modules": ["complaints", "applications", "notices"],
                "helpline_toll_free": "1800-180-4567"
            }
        )
        org_pnn = Organization(
            code="PNN-UP",
            name="Prayagraj Nagar Nigam",
            state="Uttar Pradesh",
            branding={
                "tagline": "Triveni Sangam Divine & Smart City",
                "primary_color": "#142F58",
                "secondary_color": "#245A86",
                "portal_title": "Prayagraj Nagar Nigam Portal"
            },
            config={
                "supported_languages": ["en", "hi"],
                "enabled_modules": ["complaints", "applications", "notices"],
                "helpline_toll_free": "1800-180-9988"
            }
        )

        session.add_all([org_lmc, org_vnn, org_ann, org_pnn])
        await session.flush()

        # Settings
        lmc_settings = OrganizationSetting(
            organization_id=org_lmc.id,
            helpline_number="1800-180-1533",
            contact_email="commissioner@lmc.up.nic.in",
            office_address="Triloknath Marg, Lalbagh, Lucknow, Uttar Pradesh 226001",
            emergency_contacts={
                "central_control_room": "0522-2611116",
                "fire": "101",
                "water_helpline": "0522-2623344",
                "ambulance": "108"
            },
            sla_default_hours=48
        )
        session.add(lmc_settings)

        # 3. Seed Cities
        city_lucknow = City(
            organization_id=org_lmc.id,
            name="Lucknow",
            state="Uttar Pradesh",
            pin_code="226001",
            latitude=26.8467,
            longitude=80.9462,
            description="The administrative capital of Uttar Pradesh, renowned for historic Awadhi culture, gardens, and modern urban infrastructure.",
            photo_url="https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80"
        )
        city_varanasi = City(
            organization_id=org_vnn.id,
            name="Varanasi",
            state="Uttar Pradesh",
            pin_code="221001",
            latitude=25.3176,
            longitude=82.9739,
            description="The world's oldest living cultural capital on the banks of Ganga, leading modern heritage conservation and clean city missions.",
            photo_url="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80"
        )
        city_agra = City(
            organization_id=org_ann.id,
            name="Agra",
            state="Uttar Pradesh",
            pin_code="282001",
            latitude=27.1767,
            longitude=78.0081,
            description="Global tourism hub and heritage city home to the Taj Mahal, focusing on eco-sensitive sanitation and green transport.",
            photo_url="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80"
        )
        city_prayagraj = City(
            organization_id=org_pnn.id,
            name="Prayagraj",
            state="Uttar Pradesh",
            pin_code="211001",
            latitude=25.4358,
            longitude=81.8463,
            description="Holy confluence city of Ganga, Yamuna, and Saraswati, serving millions through world-class civic arrangements and smart riverbank management.",
            photo_url="https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"
        )
        session.add_all([city_lucknow, city_varanasi, city_agra, city_prayagraj])
        await session.flush()

        # 4. Seed Wards & Localities for Lucknow
        w_hazratganj = Ward(city_id=city_lucknow.id, ward_number="W-01", ward_name="Hazratganj", zone_name="Zone 1 - Central", office_address="GPO Compound, Hazratganj", contact_phone="0522-2289101")
        w_gomtinagar = Ward(city_id=city_lucknow.id, ward_number="W-02", ward_name="Gomti Nagar", zone_name="Zone 4 - Trans-Gomti", office_address="Vibhuti Khand Ward Office", contact_phone="0522-2304501")
        w_alambagh = Ward(city_id=city_lucknow.id, ward_number="W-03", ward_name="Alambagh", zone_name="Zone 5 - South", office_address="Chander Nagar Market Office", contact_phone="0522-2451201")
        w_chowk = Ward(city_id=city_lucknow.id, ward_number="W-04", ward_name="Chowk", zone_name="Zone 2 - Old City", office_address="Victoria Street, Chowk", contact_phone="0522-2256701")
        session.add_all([w_hazratganj, w_gomtinagar, w_alambagh, w_chowk])
        await session.flush()

        session.add_all([
            Locality(ward_id=w_hazratganj.id, name="Lalbagh Market", postal_code="226001"),
            Locality(ward_id=w_hazratganj.id, name="Park Road Officers Colony", postal_code="226001"),
            Locality(ward_id=w_hazratganj.id, name="Shahnajaf Road", postal_code="226001"),
            Locality(ward_id=w_gomtinagar.id, name="Vipul Khand", postal_code="226010"),
            Locality(ward_id=w_gomtinagar.id, name="Vibhuti Khand Commercial Complex", postal_code="226010"),
            Locality(ward_id=w_gomtinagar.id, name="Patrakar Puram", postal_code="226010"),
            Locality(ward_id=w_alambagh.id, name="Singar Nagar", postal_code="226005"),
            Locality(ward_id=w_alambagh.id, name="Sujanpura", postal_code="226005"),
            Locality(ward_id=w_chowk.id, name="Kashmiri Mohalla", postal_code="226003"),
            Locality(ward_id=w_chowk.id, name="Rani Katra", postal_code="226003")
        ])

        # Wards for Varanasi
        w_assi = Ward(city_id=city_varanasi.id, ward_number="V-01", ward_name="Assi Ghat", zone_name="South Zone", office_address="Near Assi Crossing", contact_phone="0542-2311222")
        w_dasha = Ward(city_id=city_varanasi.id, ward_number="V-02", ward_name="Dashashwamedh", zone_name="Ghat Zone", office_address="Godowlia Chowk Office", contact_phone="0542-2311333")
        session.add_all([w_assi, w_dasha])
        await session.flush()
        session.add_all([
            Locality(ward_id=w_assi.id, name="Dumraon Colony", postal_code="221005"),
            Locality(ward_id=w_assi.id, name="Nagwa", postal_code="221005"),
            Locality(ward_id=w_dasha.id, name="Kashi Vishwanath Corridor Area", postal_code="221001"),
        ])

        # 5. Seed Departments (for Lucknow Municipal Corporation)
        dept_swm = Department(
            organization_id=org_lmc.id,
            code="SWM",
            name="Solid Waste Management & Sanitation",
            description="Responsible for door-to-door garbage collection, mechanised sweeping, and bio-methanation plants.",
            head_officer_name="Dr. Arvind K. Sharma (Additional Commissioner)",
            email="sanitation@lmc.up.nic.in",
            helpline_phone="0522-2611116"
        )
        dept_jal = Department(
            organization_id=org_lmc.id,
            code="JAL",
            name="Water Works & Drainage (Jal Sansthan)",
            description="Potable water pipeline distribution, tubewell operations, and monsoon storm drainage.",
            head_officer_name="Er. Ramakant Verma (General Manager)",
            email="jalsansthan@lmc.up.nic.in",
            helpline_phone="0522-2623344"
        )
        dept_pwd = Department(
            organization_id=org_lmc.id,
            code="ENG",
            name="Civil Infrastructure & Street Lighting",
            description="Road resurfacing, footpath maintenance, and smart LED street lighting networks.",
            head_officer_name="Er. B.P. Singh (Chief Engineer)",
            email="engineering@lmc.up.nic.in",
            helpline_phone="0522-2624455"
        )
        dept_rev = Department(
            organization_id=org_lmc.id,
            code="REV",
            name="Revenue & Property Tax Assessment",
            description="House tax calculations, municipal shop leases, and online billing verifications.",
            head_officer_name="Smt. Meera Trivedi (Chief Tax Assessment Officer)",
            email="taxrevenue@lmc.up.nic.in",
            helpline_phone="0522-2625566"
        )
        session.add_all([dept_swm, dept_jal, dept_pwd, dept_rev])
        await session.flush()

        # 6. Seed Users
        common_password_hash = get_password_hash("NagarConnect@2026")
        citizen_password_hash = get_password_hash("Citizen@2026")

        # Platform Super Admin
        u_platform = User(
            email="superadmin@nagarconnect.gov.in",
            phone="9876500001",
            hashed_password=common_password_hash,
            user_type="PLATFORM_ADMIN",
            is_active=True,
            is_verified=True
        )
        session.add(u_platform)
        await session.flush()
        session.add(UserRole(user_id=u_platform.id, role_id=roles_map[RoleEnum.PLATFORM_SUPER_ADMIN].id))

        # Municipal Super Admin (Lucknow)
        u_lmc_admin = User(
            organization_id=org_lmc.id,
            email="admin@lmc.gov.in",
            phone="9876500002",
            hashed_password=common_password_hash,
            user_type="STAFF",
            is_active=True,
            is_verified=True
        )
        session.add(u_lmc_admin)
        await session.flush()
        session.add(UserRole(user_id=u_lmc_admin.id, role_id=roles_map[RoleEnum.MUNICIPAL_SUPER_ADMIN].id))
        session.add(StaffProfile(
            user_id=u_lmc_admin.id,
            employee_id="LMC-EMP-001",
            designation="Municipal Municipal Administrator"
        ))

        # Department Officer (Sanitation)
        u_sanitation_officer = User(
            organization_id=org_lmc.id,
            email="officer.sanitation@lmc.gov.in",
            phone="9876500003",
            hashed_password=common_password_hash,
            user_type="STAFF",
            is_active=True,
            is_verified=True
        )
        session.add(u_sanitation_officer)
        await session.flush()
        session.add(UserRole(user_id=u_sanitation_officer.id, role_id=roles_map[RoleEnum.DEPARTMENT_OFFICER].id))
        session.add(StaffProfile(
            user_id=u_sanitation_officer.id,
            employee_id="LMC-EMP-045",
            designation="Chief Sanitary Inspector",
            department_id=dept_swm.id
        ))

        # Ward Officer (Hazratganj)
        u_ward_officer = User(
            organization_id=org_lmc.id,
            email="ward.hazratganj@lmc.gov.in",
            phone="9876500004",
            hashed_password=common_password_hash,
            user_type="STAFF",
            is_active=True,
            is_verified=True
        )
        session.add(u_ward_officer)
        await session.flush()
        session.add(UserRole(user_id=u_ward_officer.id, role_id=roles_map[RoleEnum.WARD_OFFICER].id))
        session.add(StaffProfile(
            user_id=u_ward_officer.id,
            employee_id="LMC-EMP-102",
            designation="Ward Officer",
            ward_id=w_hazratganj.id
        ))

        # Demo Citizens
        u_citizen_1 = User(
            organization_id=org_lmc.id,
            email="citizen@example.com",
            phone="9876511111",
            hashed_password=citizen_password_hash,
            user_type="CITIZEN",
            is_active=True,
            is_verified=True
        )
        session.add(u_citizen_1)
        await session.flush()
        session.add(UserRole(user_id=u_citizen_1.id, role_id=roles_map[RoleEnum.CITIZEN].id))
        session.add(CitizenProfile(
            user_id=u_citizen_1.id,
            first_name="Rajesh",
            last_name="Verma",
            address="Flat 402, Shahnajaf Heights, Hazratganj",
            city_id=city_lucknow.id,
            ward_id=w_hazratganj.id,
            preferred_language="en"
        ))

        u_citizen_2 = User(
            organization_id=org_vnn.id,
            email="citizen.varanasi@example.com",
            phone="9876522222",
            hashed_password=citizen_password_hash,
            user_type="CITIZEN",
            is_active=True,
            is_verified=True
        )
        session.add(u_citizen_2)
        await session.flush()
        session.add(UserRole(user_id=u_citizen_2.id, role_id=roles_map[RoleEnum.CITIZEN].id))
        session.add(CitizenProfile(
            user_id=u_citizen_2.id,
            first_name="Ananya",
            last_name="Mishra",
            address="House 12/B, Nagwa, Near Assi Ghat",
            city_id=city_varanasi.id,
            ward_id=w_assi.id,
            preferred_language="hi"
        ))

        # 7. Seed Civic Service Definitions
        s_birth = ServiceDefinition(
            organization_id=org_lmc.id,
            department_id=dept_rev.id,
            code="SRV-BIRTH-01",
            title="Application for Issuance of Birth Certificate",
            description="Apply for verified computerized Birth Certificate with digital municipal stamp. Applicable for births occurring within municipal boundaries.",
            form_schema={
                "fields": [
                    {"name": "child_name", "label": "Full Name of Child", "type": "text", "required": True},
                    {"name": "dob", "label": "Date of Birth", "type": "date", "required": True},
                    {"name": "gender", "label": "Gender", "type": "select", "options": ["Male", "Female", "Other"], "required": True},
                    {"name": "father_name", "label": "Father's Full Name", "type": "text", "required": True},
                    {"name": "mother_name", "label": "Mother's Full Name", "type": "text", "required": True},
                    {"name": "hospital_name", "label": "Hospital / Place of Birth", "type": "text", "required": True}
                ]
            },
            required_documents=[
                {"code": "HOSPITAL_DISCHARGE", "title": "Hospital Discharge Slip / Institutional Slip", "required": True},
                {"code": "PARENT_ID", "title": "Aadhaar Card or Government ID of Parent", "required": True}
            ],
            sla_days=7,
            fee_amount=50.0,
            is_active=True
        )
        s_water = ServiceDefinition(
            organization_id=org_lmc.id,
            department_id=dept_jal.id,
            code="SRV-WATER-02",
            title="Application for New Domestic Water Connection",
            description="Request a new 15mm or 20mm piped municipal water connection to residential premises under Jal Sansthan grid.",
            form_schema={
                "fields": [
                    {"name": "applicant_name", "label": "Applicant Legal Name", "type": "text", "required": True},
                    {"name": "property_id", "label": "House / Property Tax ID", "type": "text", "required": True},
                    {"name": "pipe_size_mm", "label": "Required Pipe Size (mm)", "type": "select", "options": ["15mm", "20mm"], "required": True},
                    {"name": "plot_area_sqft", "label": "Built-up Area (Sq. Ft.)", "type": "number", "required": True}
                ]
            },
            required_documents=[
                {"code": "REGISTRY_COPY", "title": "Property Ownership Deed / Registry Copy", "required": True},
                {"code": "LATEST_TAX_RECEIPT", "title": "Latest House Tax Paid Receipt", "required": True}
            ],
            sla_days=14,
            fee_amount=1200.0,
            is_active=True
        )
        s_mutation = ServiceDefinition(
            organization_id=org_lmc.id,
            department_id=dept_rev.id,
            code="SRV-MUTATION-03",
            title="Property Tax Record Mutation (Naamantar)",
            description="Transfer municipal house tax registration title following sale, inheritance, or gift deed transfer.",
            form_schema={
                "fields": [
                    {"name": "property_no", "label": "Existing Municipal Property Number", "type": "text", "required": True},
                    {"name": "previous_owner", "label": "Previous Recorded Owner Name", "type": "text", "required": True},
                    {"name": "new_owner", "label": "New Owner Full Name", "type": "text", "required": True},
                    {"name": "transfer_mode", "label": "Mode of Transfer", "type": "select", "options": ["Sale Deed", "Inheritance / Will", "Gift Deed"], "required": True}
                ]
            },
            required_documents=[
                {"code": "REGISTERED_DEED", "title": "Registered Sale Deed / Succession Certificate", "required": True},
                {"code": "NO_DUES_CERTIFICATE", "title": "No-Dues House Tax Certificate", "required": True}
            ],
            sla_days=21,
            fee_amount=500.0,
            is_active=True
        )
        session.add_all([s_birth, s_water, s_mutation])
        await session.flush()

        # 8. Seed Initial Complaints
        now = datetime.now(timezone.utc)
        c1 = Complaint(
            reference_no="CMP-2026-LMC-00101",
            organization_id=org_lmc.id,
            citizen_id=u_citizen_1.id,
            city_id=city_lucknow.id,
            ward_id=w_hazratganj.id,
            department_id=dept_swm.id,
            category="Sanitation & Garbage",
            title="Commercial garbage heap overflowing near Lalbagh market crossing",
            description="The community dustbin has been overflowing for the past 48 hours. Waste is spilling onto the road creating foul smell and traffic congestion.",
            address_text="Opposite Gate 3, Lalbagh Fruit Market, Hazratganj",
            latitude=26.8488,
            longitude=80.9412,
            status=ComplaintStatus.IN_PROGRESS,
            priority="HIGH",
            assigned_to_user_id=u_sanitation_officer.id,
            sla_due_at=now + timedelta(hours=24)
        )
        session.add(c1)
        await session.flush()

        session.add(ComplaintStatusHistory(
            complaint_id=c1.id,
            from_status="SUBMITTED",
            to_status="TRIAGED",
            changed_by_user_id=u_lmc_admin.id,
            reason_or_remark="Reviewed and assigned to Sanitation Department.",
            is_citizen_visible=True
        ))
        session.add(ComplaintStatusHistory(
            complaint_id=c1.id,
            from_status="TRIAGED",
            to_status="IN_PROGRESS",
            changed_by_user_id=u_sanitation_officer.id,
            reason_or_remark="Sanitary inspector dispatched mechanized tipper truck for immediate clearance.",
            is_citizen_visible=True
        ))
        session.add(ComplaintComment(
            complaint_id=c1.id,
            user_id=u_sanitation_officer.id,
            comment="Tipper vehicle UP-32-EG-4412 on site. Waste clearance in progress.",
            is_internal_note=False
        ))

        c2 = Complaint(
            reference_no="CMP-2026-LMC-00102",
            organization_id=org_lmc.id,
            citizen_id=u_citizen_1.id,
            city_id=city_lucknow.id,
            ward_id=w_hazratganj.id,
            department_id=dept_pwd.id,
            category="Street Lighting",
            title="Non-functional street light on Park Road Officers Colony lane 4",
            description="Three consecutive LED street poles are completely dark since Monday, posing safety concerns for pedestrians at night.",
            address_text="Pole #PG-42 to #PG-44, Park Road Lane 4",
            latitude=26.8450,
            longitude=80.9490,
            status=ComplaintStatus.RESOLVED,
            priority="MEDIUM",
            assigned_to_user_id=u_ward_officer.id,
            sla_due_at=now - timedelta(hours=12),
            resolved_at=now - timedelta(hours=2),
            citizen_rating=5,
            citizen_feedback="Fixed within 24 hours. Excellent lighting restored!"
        )
        session.add(c2)
        await session.flush()

        session.add(ComplaintStatusHistory(
            complaint_id=c2.id,
            from_status="SUBMITTED",
            to_status="RESOLVED",
            changed_by_user_id=u_ward_officer.id,
            reason_or_remark="Damaged fuse replaced and LED luminaire restored.",
            is_citizen_visible=True
        ))

        # 9. Seed Service Application
        app1 = ServiceApplication(
            reference_no="APP-2026-LMC-00045",
            organization_id=org_lmc.id,
            service_id=s_birth.id,
            citizen_id=u_citizen_1.id,
            form_data={
                "child_name": "Aarav Verma",
                "dob": "2026-08-14",
                "gender": "Male",
                "father_name": "Rajesh Verma",
                "mother_name": "Pooja Verma",
                "hospital_name": "King George Medical University (KGMU) Hospital"
            },
            status=ApplicationStatus.UNDER_REVIEW,
            reviewer_user_id=u_lmc_admin.id,
            remarks="Documents in verification with civil hospital birth registry records."
        )
        session.add(app1)
        await session.flush()

        session.add(ApplicationStatusHistory(
            application_id=app1.id,
            from_status="SUBMITTED",
            to_status="UNDER_REVIEW",
            changed_by_user_id=u_lmc_admin.id,
            remarks="Application forwarded to Registrar of Births and Deaths desk."
        ))

        # 10. Seed Public Notices & Tenders
        notices = [
            Notice(
                organization_id=org_lmc.id,
                department_id=dept_jal.id,
                title="Monsoon Pre-Desilting & Drinking Water Line Maintenance Schedule 2026",
                summary="Planned pipe replacement on Hazratganj - Ashok Marg corridor on 15th-16th October. Water tankers will be deployed.",
                content="""### Notice Regarding Scheduled Water Supply Maintenance
The residents of Ward 1 (Hazratganj) and Ward 2 (Gomti Nagar Sector A) are hereby informed that the Jal Sansthan engineering team will carry out major pipeline connection work.

**Affected Timings:**
- Morning supply: Normal (06:00 AM - 08:30 AM)
- Evening supply: Low pressure (06:00 PM - 07:30 PM)

Toll-free emergency water tanker requests can be lodged directly via the NagarConnect portal or calling 0522-2623344.""",
                category="WATER",
                status=NoticeStatus.PUBLISHED,
                published_at=now - timedelta(days=2),
                created_by_user_id=u_lmc_admin.id
            ),
            Notice(
                organization_id=org_lmc.id,
                department_id=dept_swm.id,
                title="Special Cleanliness Drive 'Swachh Nagar Abhiyan' Across All 110 Wards",
                summary="Night mechanized sweeping and 100% segregated door-to-door waste collection drive launched.",
                content="""### Comprehensive Citywide Cleanliness Initiative
Lucknow Municipal Corporation announces an intensive 30-day cleanliness campaign focusing on commercial market complexes, public parks, and secondary waste transfer stations.

Citizens are requested to segregate dry, wet, and hazardous electronic waste at source before handing over to municipal electric tippers.""",
                category="SANITATION",
                status=NoticeStatus.PUBLISHED,
                published_at=now - timedelta(days=4),
                created_by_user_id=u_lmc_admin.id
            ),
            Notice(
                organization_id=org_lmc.id,
                department_id=dept_pwd.id,
                title="E-Tender Notice: Supply and Erection of 2500 Smart Solar LED Poles (Tender Ref: LMC/ENG/2026/088)",
                summary="Sealed digital bids invited through UP e-Procurement for supply and 5-year maintenance of solar street lighting.",
                content="""### Online Notice Inviting Tender (NIT)
Executive Engineer (Street Lighting), LMC invites item-rate e-tenders from reputed manufacturers and Class-A electrical contractors.

- **Earnest Money Deposit (EMD):** INR 5,00,000
- **Bid Submission Deadline:** 30th October 2026, 17:00 IST
- **Technical Bid Opening:** 31st October 2026, 11:30 IST

Download full RFP documents from the official municipal portal.""",
                category="TENDER",
                status=NoticeStatus.PUBLISHED,
                published_at=now - timedelta(days=6),
                created_by_user_id=u_lmc_admin.id
            ),
            Notice(
                organization_id=org_vnn.id,
                title="Ghat Beautification & Pilgrim Facilitation Advisory During Dev Deepawali Festival",
                summary="Special boat traffic guidelines, crowd dispersal routes, and temporary eco-toilets along 84 Ghats.",
                content="""### Public Advisory - Varanasi Nagar Nigam
In preparation for the sacred Dev Deepawali celebrations, special sanitation teams will operate in 3 shifts across Dashashwamedh, Assi, and Rajghat.

Zero-plastic guidelines will be strictly enforced in compliance with National Green Tribunal orders.""",
                category="ADVISORY",
                status=NoticeStatus.PUBLISHED,
                published_at=now - timedelta(days=1),
                created_by_user_id=u_platform.id
            )
        ]
        session.add_all(notices)

        await session.commit()
        print("✅ NagarConnect test dataset successfully seeded!")

if __name__ == "__main__":
    asyncio.run(seed_data())
