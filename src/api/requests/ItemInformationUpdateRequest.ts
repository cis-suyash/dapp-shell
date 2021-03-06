import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class ItemInformationUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public title: string;

    @IsNotEmpty()
    public shortDescription: string;

    @IsNotEmpty()
    public longDescription: string;

}

