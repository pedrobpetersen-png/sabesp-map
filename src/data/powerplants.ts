import { PowerPlant } from "@/types";

export const powerPlants: PowerPlant[] = [
  // === USINAS HIDRELÉTRICAS (EMAE) ===
  {
    id: "pp-001",
    name: "UHE Henry Borden (Externa)",
    lat: -23.8685,
    lng: -46.3797,
    type: "hydroelectric",
    capacity_mw: 469,
    status: "restricted",
    source: "EMAE",
    description:
      "Complexo na Serra do Mar em Cubatão. 8 grupos geradores Pelton com queda de 720m. Opera com restrições desde 1992 devido a controles ambientais na Billings.",
  },
  {
    id: "pp-002",
    name: "UHE Henry Borden (Subterrânea)",
    lat: -23.8725,
    lng: -46.3750,
    type: "hydroelectric",
    capacity_mw: 420,
    status: "restricted",
    source: "EMAE",
    description:
      "Usina subterrânea do complexo Henry Borden. 6 grupos geradores com 420 MW. Inaugurada em 1956, escavada na rocha da Serra do Mar.",
  },
  {
    id: "pp-003",
    name: "UHE Pirapora",
    lat: -23.3912,
    lng: -47.0064,
    type: "hydroelectric",
    capacity_mw: 25,
    status: "operational",
    source: "EMAE",
    description:
      "Localizada no Rio Tietê em Pirapora do Bom Jesus. Potência instalada de 25 MW com 2 unidades geradoras.",
  },
  {
    id: "pp-004",
    name: "PCH Porto Góes",
    lat: -23.1042,
    lng: -47.3667,
    type: "hydroelectric",
    capacity_mw: 24.8,
    status: "operational",
    source: "EMAE",
    description:
      "Pequena Central Hidrelétrica no Rio Tietê entre Salto e Porto Feliz. 24,8 MW de potência instalada.",
  },
  {
    id: "pp-005",
    name: "PCH Rasgão",
    lat: -23.3667,
    lng: -47.0333,
    type: "hydroelectric",
    capacity_mw: 22,
    status: "operational",
    source: "EMAE",
    description:
      "PCH localizada no Rio Tietê, próxima a Pirapora do Bom Jesus. 22 MW instalados.",
  },
  // === ELEVATÓRIAS EMAE ===
  {
    id: "pp-006",
    name: "Elevatória de Pedreira",
    lat: -23.6831,
    lng: -46.6608,
    type: "hydroelectric",
    capacity_mw: 0,
    status: "operational",
    source: "EMAE",
    description:
      "Estação elevatória que bombeia água do Rio Pinheiros para a Represa Billings. Opera apenas para controle de cheias desde 1992.",
  },
  {
    id: "pp-007",
    name: "Elevatória São Paulo (ex-Traição)",
    lat: -23.5875,
    lng: -46.6930,
    type: "hydroelectric",
    capacity_mw: 0,
    status: "operational",
    source: "EMAE",
    description:
      "Estação elevatória no Rio Pinheiros, na altura do Parque do Povo. Inverte o fluxo do Pinheiros para direcioná-lo à Billings. Antiga 'Usina de Traição', renomeada para Usina São Paulo.",
  },
  // === AUTOPRODUÇÃO SABESP ===
  {
    id: "pp-008",
    name: "PCH Isolina",
    lat: -23.45,
    lng: -46.65,
    type: "self_production",
    capacity_mw: 3.2,
    status: "operational",
    source: "SABESP",
    description:
      "Pequena central de autoprodução da SABESP aproveitando a queda d'água na adutora do Sistema Cantareira.",
  },
  {
    id: "pp-009",
    name: "Autoprodução ETE Barueri (Biogás)",
    lat: -23.5150,
    lng: -46.8800,
    type: "self_production",
    capacity_mw: 2.8,
    status: "operational",
    source: "SABESP",
    description:
      "Geração de energia elétrica a partir do biogás produzido no tratamento de esgoto da ETE Barueri.",
  },
  {
    id: "pp-010",
    name: "Autoprodução ETE Parque Novo Mundo (Biogás)",
    lat: -23.5170,
    lng: -46.5870,
    type: "self_production",
    capacity_mw: 1.5,
    status: "operational",
    source: "SABESP",
    description:
      "Cogeração com biogás do digestor anaeróbio da ETE Parque Novo Mundo.",
  },
  {
    id: "pp-011",
    name: "Autoprodução ETE ABC (Biogás)",
    lat: -23.6890,
    lng: -46.5670,
    type: "self_production",
    capacity_mw: 1.2,
    status: "operational",
    source: "SABESP",
    description:
      "Geração a biogás na ETE ABC, contribuindo para autossuficiência energética da estação.",
  },
];
