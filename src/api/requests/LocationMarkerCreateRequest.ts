import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';


export class LocationMarkerCreateRequest extends RequestBody {

    @IsNotEmpty()
    public markerTitle: string;

    @IsNotEmpty()
    public markerText: string;

    @IsNotEmpty()
    public lat: number;

    @IsNotEmpty()
    public lng: number;

}

