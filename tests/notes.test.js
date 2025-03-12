const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

let prisma;
jest.setTimeout(30000);

describe("Test sur les notes", () => {
    beforeAll(async () => {
        prisma = new PrismaClient({
            datasources: {
                db: {url: process.env.DATABASE_URL}
            }
        });
        await prisma.$executeRaw`CREATE TABLE "Notes" (id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`;
    });

    beforeEach(async () => {
        await prisma.notes.create({
            data: {
                title: "Course",
                content: "Faut acheter 3 oeufs, 2 steaks et 1 packet de chips"
            }
        });

        await prisma.notes.create({
            data: {
                title: "NE SURTOUT PAS OUBLIER",
                content: "DE FAIRE LA VAISSELLE AVANT QUE MA COPINE RENTRE!!!!!!!!!!!!!!!!!!!!"
            }
        });
    });

    afterEach(async () => {
        await prisma.$executeRaw`TRUNCATE TABLE "Notes" RESTART IDENTITY CASCADE;`
    });

    afterAll(async () => {
        await prisma.$executeRaw`DROP TABLE "Notes";`;
        await prisma.$disconnect();
    });

    test("Obtenir toutes les notes", async () => {
        const res = await prisma.notes.findMany();

        expect(res.length).toBe(2);

        expect(res[0].id).toBe(1);
        expect(res[0].title).toBe("Course");
        expect(res[0].content).toBe("Faut acheter 3 oeufs, 2 steaks et 1 packet de chips");

        expect(res[1].id).toBe(2);
        expect(res[1].title).toBe("NE SURTOUT PAS OUBLIER");
        expect(res[1].content).toBe("DE FAIRE LA VAISSELLE AVANT QUE MA COPINE RENTRE!!!!!!!!!!!!!!!!!!!!");
    });

    test("Obtenir qu'une seule note en fonction de l'id", async () => {
        const res = await prisma.notes.findUnique({
            where: {id: 2}
        });

        expect(res.id).toBe(2);
        expect(res.title).toBe("NE SURTOUT PAS OUBLIER");
        expect(res.content).toBe("DE FAIRE LA VAISSELLE AVANT QUE MA COPINE RENTRE!!!!!!!!!!!!!!!!!!!!");
    });

    test("Créer une note", async () => {
        await prisma.notes.create({
            data: {
                title: "Coucou",
                content: "Salut"
            }
        });

        const res = await prisma.notes.findMany();

        expect(res.length).toBe(3);
        expect(res[2].id).toBe(3);
        expect(res[2].title).toBe("Coucou");
        expect(res[2].content).toBe("Salut");
    });

    test("Mettre à jour une note", async () => {
        await prisma.notes.update({
            where: {
                id: 1
            },
            data: {
                title: "Roses are red",
                content: "Violets are blue"
            }
        });

        const res = await prisma.notes.findMany();

        expect(res.length).toBe(2);

        expect(res[1].id).toBe(1);
        expect(res[1].title).toBe("Roses are red");
        expect(res[1].title).not.toBe("Course");
        expect(res[1].content).toBe("Violets are blue");
        expect(res[1].content).not.toBe("Faut acheter 3 oeufs, 2 steaks et 1 packet de chips");
    });

    test("Supprimer une note", async () => {
        await prisma.notes.delete({
            where: {
                id: 1
            }
        });

        const res = await prisma.notes.findMany();

        expect(res.length).toBe(1);
        expect(res).not.toContain("Course");
        expect(res).not.toContain("Faut acheter 3 oeufs, 2 steaks et 1 packet de chips")
    });
});