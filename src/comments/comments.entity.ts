import { TimeoutInfo } from "rxjs";
import { TimeInterval } from "rxjs/internal/operators/timeInterval";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
    export class Comment {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        ticket_id: number;

        @Column()
        user_id: number;

        @Column()
        message: string;

        @Column()
        created_at: Date;

    }
    