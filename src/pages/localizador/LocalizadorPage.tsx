import { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Slider } from 'primereact/slider';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { APIProvider, Map, AdvancedMarker, Pin, useMapsLibrary, MapControl, ControlPosition } from '@vis.gl/react-google-maps';
import mapPin from '../../assets/map-pin.svg';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { MultiSelect } from 'primereact/multiselect';
import { Badge } from 'primereact/badge';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ToggleButton } from 'primereact/togglebutton';

interface OperadorLocalizador {
    id_operador: number;
    nombre_operador: string;
    contacto?: string;
    telefono?: string;
    email?: string;
    direccion?: string;
    UbicacionLat?: number;
    UbicacionLog?: number;
    RFC?: string;
    Pais?: string;
    Estado?: string;
    Delegacion?: string;
    Colonia?: string;
    Lada?: string;
    tipo_servicio?: string[];
    descripcion_servicio?: string[];
    tipo_negocio?: string;
    descripcion_negocio?: string;
    distance_km?: number;
    tipo_poliza?: string[];
    descripcion_tipo_poliza?: string[];
}

interface TipoServicio {
    id_tipo_servicio: number;
    nombre: string;
    descripcion: string;
}

interface TipoPolizaFacet {
    value: string;
    count: number;
}

/*
interface TypesenseFacetCount {
    count: number;
    highlighted: string;
    value: string;
}
*/

interface TypesenseFacet {
    field_name: string;
    counts: Array<{
        count: number;
        highlighted: string;
        value: string;
    }>;
    stats: {
        total_values: number;
    };
}

interface TypesenseResponse {
    hits: OperadorLocalizador[];
    facet_counts: TypesenseFacet[];
}

interface FacetCount {
    value: string;
    count: number;
}

interface SearchParams {
    lat: number;
    lon: number;
    radius: number;
    q: string;
    tipos_servicio: string[];
    tipos_negocio: string[];
    tipos_poliza: string[];
    last_search?: string;
}

interface FacetOption {
    label: string;
    value: string;
    count?: number;
}

interface PlaceResult extends google.maps.places.PlaceResult {
    geometry?: {
        location?: google.maps.LatLng;
    };
}

const OperadorMarker = ({
    operador,
    //isSelected,
    onHide,
    onClick
}: {
    operador: OperadorLocalizador,
    //isSelected: boolean,
    onHide: () => void,
    onClick: (e: React.MouseEvent) => void
}) => {
    const op = useRef<OverlayPanel>(null);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevenir propagación del evento
        onClick(e);
        op.current?.toggle(e);
    };

    return (
        <>
            <div onClick={handleClick}>
                <CustomPin />
            </div>
            <OverlayPanel
                ref={op}
                className="w-25rem"
                showCloseIcon
                onHide={onHide}
            >
                <div className="flex flex-column gap-3">
                    <div className="flex align-items-center justify-content-between">
                        <h3 className="text-xl font-bold m-0">{operador.nombre_operador}</h3>
                        <Tag value={operador.tipo_negocio} severity="info" />
                    </div>

                    <div className="flex flex-column gap-2">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-map-marker" />
                            <span>{operador.direccion}</span>
                        </div>
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-phone" />
                            <span>{operador.telefono || 'No disponible'}</span>
                        </div>
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-compass" />
                            <span>Distancia: {operador.distance_km?.toFixed(2) || ''} km</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        <div>

                            {operador.tipo_servicio && operador.tipo_servicio.length > 0 && (
                                <div className="flex flex-column gap-2">
                                    <label className="font-bold">Servicios:</label>
                                    <div className="flex flex-wrap gap-1">
                                        {operador.tipo_servicio.map((tipo, index) => (
                                            <Tag key={index} value={tipo} />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                        <div>

                            {operador.tipo_poliza && operador.tipo_poliza.length > 0 && (
                                <div className="flex flex-column gap-2">
                                    <label className="font-bold">Pólizas:</label>
                                    <div className="flex flex-wrap gap-1">
                                        {operador.tipo_poliza.map((tipo, index) => (
                                            <Tag key={index} value={tipo} severity="success" />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    <Button icon="pi pi-whatsapp" rounded severity="success" aria-label="Search" onClick={() => alert("Vinculo:  " + `https://www.google.com/maps?q=${operador.UbicacionLat},${operador.UbicacionLog}`)} />

                </div>
            </OverlayPanel>
        </>
    );
};

const CustomPin = () => {
    return (
        <div className="relative w-8 h-8 transform -translate-x-1/2 -translate-y-full">
            <img
                src={mapPin}
                alt="Location pin"
                className="w-full h-full object-contain"
                style={{ filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))' }}
            />
        </div>
    );
};

const FacetOptionTemplate = (option: FacetOption) => {
    return (
        <div className="flex align-items-center justify-content-between">
            <span>{option.label}</span>
            {option.count !== undefined && (
                <Badge value={option.count} severity="info" className="ml-2" />
            )}
        </div>
    );
};

// Componente PlaceAutocomplete
interface PlaceAutocompleteProps {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

const PlaceAutocomplete = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
    const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const places = useMapsLibrary('places');

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const options = {
            fields: ['geometry', 'name', 'formatted_address']
        };

        setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
    }, [places]);

    useEffect(() => {
        if (!placeAutocomplete) return;

        placeAutocomplete.addListener('place_changed', () => {
            const place = placeAutocomplete.getPlace();
            onPlaceSelect(place);
        });
    }, [onPlaceSelect, placeAutocomplete]);

    return (
        <div className="autocomplete-container">
            <InputText ref={inputRef} placeholder="Buscar dirección..." className="w-full" />
        </div>
    );
};

export default function LocalizadorPage() {
    const [operadores, setOperadores] = useState<OperadorLocalizador[]>([]);
    const [loading, setLoading] = useState(false);
    const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);
    const [searchParams, setSearchParams] = useState<SearchParams>({
        lat: 19.436870,
        lon: -99.150082,
        radius: 20,
        q: '',
        tipos_servicio: [],
        tipos_negocio: [],
        tipos_poliza: []
    });
    const [currentPosition, setCurrentPosition] = useState({
        lat: searchParams.lat,
        lng: searchParams.lon
    });
    const [distance, setDistance] = useState<number>(20);
    const [isPanelVisible, setIsPanelVisible] = useState(true);
    const [selectedOperador, setSelectedOperador] = useState<OperadorLocalizador | null>(null);
    const [tiposPolizaFacets, setTiposPolizaFacets] = useState<TipoPolizaFacet[]>([]);
    const [selectedTiposPoliza, setSelectedTiposPoliza] = useState<string[]>([]);
    const [facets, setFacets] = useState<{
        tipo_servicio: FacetCount[];
        tipo_negocio: FacetCount[];
        tipo_poliza: FacetCount[];
    }>({
        tipo_servicio: [],
        tipo_negocio: [],
        tipo_poliza: []
    });
    const [checked, setChecked] = useState(false);

    const places = useMapsLibrary('places');

    // Sincronizar currentPosition con searchParams
    useEffect(() => {
        setCurrentPosition({
            lat: searchParams.lat,
            lng: searchParams.lon
        });
    }, [searchParams.lat, searchParams.lon]);

    // Buscar operadores al cargar la página
    useEffect(() => {
        buscarOperadores();
    }, []);

    // Cargar tipos de servicio al iniciar
    useEffect(() => {
        fetchTiposServicio();
    }, []);

    const fetchTiposServicio = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/tipos-servicio`);
            if (response.ok) {
                const data = await response.json();
                setTiposServicio(data);
            }
        } catch (error) {
            console.error('Error al cargar tipos de servicio:', error);
        }
    };

    const buscarOperadores = async () => {
        setLoading(true);
        try {


            const params = new URLSearchParams({
                lat: currentPosition.lat.toString(),
                lon: currentPosition.lng.toString(),
                radius: searchParams.radius.toString(),
                q: searchParams.q
            });

            // Agregar filtros de facets
            if (searchParams.tipos_servicio.length > 0) {
                params.append('tipos_servicio', searchParams.tipos_servicio.join(','));
            }
            if (searchParams.tipos_negocio.length > 0) {
                params.append('tipos_negocio', searchParams.tipos_negocio.join(','));
            }
            if (searchParams.tipos_poliza.length > 0) {
                params.append('tipos_poliza', searchParams.tipos_poliza.join(','));
            }

            console.log('Buscando operadores...', searchParams);

            const response = await fetch(`${import.meta.env.VITE_PUBLIC_API_URL}/api/operadores/localizador?${params}`);
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            const data: TypesenseResponse = await response.json();

            // Procesar los facets de la respuesta
            const processFacets = (facetName: string) => {
                const facet = data.facet_counts.find(f => f.field_name === facetName);
                return facet?.counts.map(c => ({
                    value: c.value,
                    count: c.count
                })) || [];
            };

            setFacets({
                tipo_servicio: processFacets('tipo_servicio'),
                tipo_negocio: processFacets('tipo_negocio'),
                tipo_poliza: processFacets('tipo_poliza')
            });

            setOperadores(data.hits);


        } catch (error) {
            console.error('Error al buscar operadores:', error);
        } finally {
            setLoading(false);
        }
    };

    // Actualizar coordenadas y radio
    const handleCoordinatesChange = (lat: number | null, lng: number | null) => {
        if (lat !== null) {
            setSearchParams(prev => ({ ...prev, lat }));
        }
        if (lng !== null) {
            setSearchParams(prev => ({ ...prev, lon: lng }));
        }
    };

    const handleRadiusChange = (value: number) => {
        setSearchParams(prev => ({ ...prev, radius: value }));
    };

    const tiposServicioTemplate = (rowData: OperadorLocalizador) => {
        return (
            <div className="flex flex-wrap gap-1">
                {rowData.tipo_servicio?.map((tipo, index) => (
                    <Tag key={index} value={tipo} />
                ))}
            </div>
        );
    };

    const tiposPolizaTemplate = (rowData: OperadorLocalizador) => {
        return (
            <div className="flex flex-wrap gap-1">
                {rowData.tipo_poliza?.map((tipo, index) => (
                    <Tag
                        key={index}
                        value={tipo}
                        severity="info"
                    />
                ))}
            </div>
        );
    };

    const distanciaTemplate = (rowData: OperadorLocalizador) => {
        return rowData.distance_km ? `${rowData.distance_km.toFixed(2)} km` : '';
    };

    const ubicacionTemplate = (rowData: OperadorLocalizador) => {
        return (
            <div>
                <div>Lat: {rowData.UbicacionLat}</div>
                <div>Lon: {rowData.UbicacionLog}</div>
            </div>
        );
    };

    // Convertir facets a opciones para MultiSelect
    const getFacetOptions = (facets: FacetCount[]): FacetOption[] => {
        return facets.map(facet => ({
            label: facet.value,
            value: facet.value,
            count: facet.count
        }));
    };

    // Reemplazar useJsApiLoader por la lógica de manejo de lugares
    const handlePlaceSelect = (place: google.maps.places.PlaceResult | null) => {
        if (place?.geometry?.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            handleCoordinatesChange(lat, lng);
        }
    };

    // Se ejecuta cuando se cambia el estado de searchParams y se quita la invocación a buscarOperadores
    useEffect(() => {
        console.log('searchParams', searchParams);
        if ((searchParams.tipos_negocio.length >= 0 || searchParams.tipos_servicio.length >= 0 || searchParams.tipos_poliza.length >= 0) && (searchParams.last_search !== undefined)) {
            buscarOperadores();
            setSearchParams(prev => ({ ...prev, last_search: undefined }));
        }
    }, [searchParams]);

    return (
        <div className="grid relative">

            <div className={`${isPanelVisible ? 'col-12 md:col-3' : 'hidden'}`}>
                <Panel
                    header="Punto de partida"
                    toggleable
                    collapsed={false}
                    className="mb-3"
                    expandIcon="pi pi-chevron-down"
                    collapseIcon="pi pi-chevron-up"
                >
                    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                        <div className="field">
                            <label htmlFor="search" className="block font-bold mb-2">
                                Buscar dirección
                            </label>
                            <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
                        </div>
                    </APIProvider>


                    <div className="flex flex-row gap-3">


                    <div className="field mb-3">
                            <label className="block font-bold mb-2">
                                Selección
                            </label>
                            <ToggleButton
                                checked={checked} onChange={(e) => setChecked(e.value)}
                                onLabel="Mapa"
                                offLabel="N/D"
                                onIcon="pi pi-map-marker"
                                offIcon="pi pi-ban"
                                className="w-full"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="lat" className="block font-bold mb-2">
                                Latitud
                            </label>
                            <InputNumber inputClassName='w-full'
                                id="lat"
                                value={searchParams.lat}
                                onChange={(e) => handleCoordinatesChange(e.value, null)}
                                mode="decimal"
                                minFractionDigits={6}
                                maxFractionDigits={6}                                
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="lng" className="block font-bold mb-2">
                                Longitud
                            </label>
                            <InputNumber inputClassName='w-full'
                                id="lng"
                                value={searchParams.lon}
                                onChange={(e) => handleCoordinatesChange(null, e.value)}
                                mode="decimal"
                                minFractionDigits={6}
                                maxFractionDigits={6}
                            />
                        </div>

                        


                    </div>
                </Panel>

                <Panel
                    header="Filtros"
                    toggleable
                    collapsed={false}
                    className="mb-3"
                    expandIcon="pi pi-chevron-down"
                    collapseIcon="pi pi-chevron-up"
                >
                    <div className="field">
                        <label className="block font-bold mb-2">
                            Distancia (km): {searchParams.radius}
                        </label>
                        <Slider
                            value={searchParams.radius}
                            onChange={(e) => handleRadiusChange(e.value as number)}
                            min={1}
                            max={200}
                            className="w-full"
                        />
                    </div>

                    <div className="field">
                        <label className="block font-bold mb-2">
                            Tipos de Servicio
                        </label>
                        <MultiSelect
                            value={searchParams.tipos_servicio}
                            options={getFacetOptions(facets.tipo_servicio)}
                            onChange={(e) => {
                                setSearchParams(prev => ({
                                    ...prev,
                                    tipos_servicio: e.value,
                                    last_search: new Date().toISOString()
                                }));
                            }}
                            optionLabel="label"
                            placeholder="Seleccione tipos de servicio"
                            display="chip"
                            itemTemplate={FacetOptionTemplate}
                            className="w-full"
                            filter
                            showClear
                        />
                    </div>

                    <div className="field mt-3">
                        <label className="block font-bold mb-2">
                            Tipos de Negocio
                        </label>
                        <MultiSelect
                            value={searchParams.tipos_negocio}
                            options={getFacetOptions(facets.tipo_negocio)}
                            onChange={(e) => {
                                setSearchParams({
                                    ...searchParams,
                                    tipos_negocio: e.value,
                                    last_search: new Date().toISOString()
                                });
                                console.log('Tipos de negocio change:', searchParams);
                            }}
                            optionLabel="label"
                            placeholder="Seleccione tipos de negocio"
                            display="chip"
                            itemTemplate={FacetOptionTemplate}
                            className="w-full"
                            filter
                            showClear
                        />
                    </div>

                    <div className="field mt-3">
                        <label className="block font-bold mb-2">
                            Tipos de Póliza
                        </label>
                        <MultiSelect
                            value={searchParams.tipos_poliza}
                            options={getFacetOptions(facets.tipo_poliza)}
                            onChange={(e) => {
                                setSearchParams(prev => ({
                                    ...prev,
                                    tipos_poliza: e.value,
                                    last_search: new Date().toISOString()
                                }));
                            }}
                            optionLabel="label"
                            placeholder="Seleccione tipos de póliza"
                            display="chip"
                            itemTemplate={FacetOptionTemplate}
                            className="w-full"
                            filter
                            showClear
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="search" className="block font-bold mb-2">
                            Búsqueda
                        </label>
                        <InputText
                            id="search"
                            value={searchParams.q}
                            onChange={(e) =>
                                setSearchParams(prev => ({
                                    ...prev,
                                    q: e.target.value
                                }))}
                            placeholder="Buscar por nombre, dirección..."
                            className="w-full"
                        />
                    </div>

                    <Button
                        label="Aplicar Filtros"
                        icon="pi pi-search"
                        onClick={buscarOperadores}
                        loading={loading}
                        className="w-full mt-3"
                    />
                </Panel>

                <Panel
                    header={`Resultados (${operadores.length})`}
                    toggleable
                    collapsed={false}
                    className="mb-3"
                    expandIcon="pi pi-chevron-down"
                    collapseIcon="pi pi-chevron-up"
                >
                    <DataTable
                        value={operadores}
                        scrollable
                        scrollHeight="50vh"
                        loading={loading}
                        emptyMessage="No se encontraron operadores"
                    >
                        <Column body={distanciaTemplate} header="Distancia" sortable field="distance_km" />
                        <Column field="nombre_operador" header="Nombre" />
                        <Column field="telefono" header="Teléfono" />
                        <Column field="direccion" header="Dirección" />
                        <Column field="tipo_negocio" header="Tipo de Negocio" />
                        <Column body={tiposServicioTemplate} header="Tipos de Servicio" />
                        <Column body={tiposPolizaTemplate} header="Tipos de Póliza" />



                        {/*<Column body={ubicacionTemplate} header="Ubicación" />*/}

                    </DataTable>
                </Panel>
            </div>

            {/* Mapa */}
            
                <div className={`col-12 ${isPanelVisible ? 'md:col-9' : 'md:col-12'}`}>
                    <Card title="Mapa de operadores">
                        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                            <Map
                                defaultCenter={{ lat: currentPosition.lat, lng: currentPosition.lng }}
                                defaultZoom={12}
                                style={{ width: '100%', height: '80vh' }}
                                mapId={'40fe44799e2ac9d0'}
                                gestureHandling={'greedy'}

                                draggableCursor="default"
                                draggingCursor="pointer"

                                onClick={(e) => {
                                    if (checked) {
                                        if (e.detail?.latLng) {
                                            handleCoordinatesChange(
                                                e.detail.latLng.lat,
                                                e.detail.latLng.lng
                                            );
                                        }
                                    }
                                }}

                            >
                                {/* Marcador de posición actual */}
                                <AdvancedMarker
                                    position={currentPosition}
                                    title="Mi ubicación"
                                >
                                    <Pin
                                        background={'#cc00ffff'}
                                        borderColor={'#006425'}
                                        glyphColor={'white'}
                                    />
                                </AdvancedMarker>

                                {/* Marcadores de operadores */}
                                {operadores.map((operador) => (
                                    <AdvancedMarker
                                        key={operador.id_operador}
                                        position={{
                                            lat: operador.UbicacionLat || 0,
                                            lng: operador.UbicacionLog || 0
                                        }}
                                        title={operador.nombre_operador}
                                        onClick={() => setSelectedOperador(operador)}
                                    >
                                        <OperadorMarker
                                            operador={operador}
                                            //isSelected={selectedOperador?.id_operador === operador.id_operador}
                                            onHide={() => setSelectedOperador(null)}
                                            onClick={() => setSelectedOperador(operador)}
                                        />
                                    </AdvancedMarker>
                                ))}
                            </Map>
                        </APIProvider>
                    </Card>
                </div>
            

            {/* Botón flotante para mostrar/ocultar panel */}
            <Button
                icon={isPanelVisible ? "pi pi-angle-left" : "pi pi-angle-right"}
                onClick={() => setIsPanelVisible(!isPanelVisible)}
                className="p-button-rounded p-button-secondary"
                style={{
                    position: 'fixed',
                    left: isPanelVisible ? '0.5rem' : '0.5rem',
                    top: '140px',
                    transform: 'translateY(-50%)',
                    zIndex: 1000
                }}
                tooltip={isPanelVisible ? "Ocultar panel" : "Mostrar panel"}
                tooltipOptions={{ position: 'right' }}
            />

        </div>
    );
} 